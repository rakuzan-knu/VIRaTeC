import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ContentFields, RecordData } from '@viratec/contracts';
import {
  PREVIEW_CONTENT_QUERY_KEY,
  RECORD_QUERY_ROOTS,
  useContentPreviewStore,
  type PageLayoutOverride,
} from '@/shared/lib';
import { RTL_LOCALES, isLocale, useLocaleStore, type Locale } from '@/shared/i18n';
import { refreshRecordQueries } from './queries';
import type { FrameTarget } from './useCanvasTargets';

export const EDITOR_FRAME_NAME = 'viratec-editor-frame';

const MESSAGE_PREFIX = 'viratec-editor:';
const READY = `${MESSAGE_PREFIX}ready`;
const STATE = `${MESSAGE_PREFIX}state`;
const REFRESH = `${MESSAGE_PREFIX}refresh`;
const CONFIG = `${MESSAGE_PREFIX}config`;
const TARGET = `${MESSAGE_PREFIX}target`;
const KEY = `${MESSAGE_PREFIX}key`;
const REFRESH_DELAY_MS = 300;

export const isEditorFrame = () =>
  typeof window !== 'undefined' && window.name === EDITOR_FRAME_NAME;

interface FrameState {
  entryOverrides: Record<string, ContentFields>;
  recordOverrides: Record<string, RecordData>;
  layoutOverride: PageLayoutOverride | null;
}

export interface FrameConfig {
  isEditing: boolean;
  locale: Locale | null;
  hasSelection: boolean;
}

export interface FrameKey {
  key: string;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

const NO_CONFIG: FrameConfig = { isEditing: false, locale: null, hasSelection: false };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const messageType = (data: unknown) =>
  isObject(data) && typeof data.type === 'string' ? data.type : null;

const readState = (data: unknown): FrameState | null => {
  if (!isObject(data) || !isObject(data.entryOverrides) || !isObject(data.recordOverrides)) {
    return null;
  }
  return data as unknown as FrameState;
};

const readConfig = (data: unknown): FrameConfig | null => {
  if (!isObject(data) || typeof data.isEditing !== 'boolean') return null;
  return {
    isEditing: data.isEditing,
    locale: isLocale(data.locale) ? data.locale : null,
    hasSelection: data.hasSelection === true,
  };
};

const readTarget = (data: unknown): FrameTarget | null => {
  if (!isObject(data) || !isObject(data.target)) return null;
  const { target } = data;
  if (target.kind === 'section')
    return typeof target.sectionId === 'string' ? (target as unknown as FrameTarget) : null;
  if (target.kind !== 'field' && target.kind !== 'entry' && target.kind !== 'asset') return null;
  const { address } = target;
  return isObject(address) &&
    typeof address.entryId === 'string' &&
    typeof address.contentTypeId === 'string'
    ? (target as unknown as FrameTarget)
    : null;
};

const readKey = (data: unknown): FrameKey | null =>
  isObject(data) && typeof data.key === 'string' && typeof data.code === 'string'
    ? {
        key: data.key,
        code: data.code,
        ctrlKey: data.ctrlKey === true,
        metaKey: data.metaKey === true,
        shiftKey: data.shiftKey === true,
        altKey: data.altKey === true,
      }
    : null;

const currentState = (): FrameState => {
  const { entryOverrides, recordOverrides, layoutOverride } = useContentPreviewStore.getState();
  return { entryOverrides, recordOverrides, layoutOverride };
};

export function useFrameHost(
  frame: HTMLIFrameElement | null,
  config: FrameConfig,
  onTarget: (target: FrameTarget) => void,
) {
  const queryClient = useQueryClient();
  const configRef = useRef(config);
  configRef.current = config;
  const onTargetRef = useRef(onTarget);
  onTargetRef.current = onTarget;

  useEffect(() => {
    if (!frame) return;
    const origin = window.location.origin;
    const post = (message: Record<string, unknown>) =>
      frame.contentWindow?.postMessage(message, origin);
    const sendState = () => post({ type: STATE, ...currentState() });

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== frame.contentWindow) return;
      const type = messageType(event.data);
      if (type === READY) {
        sendState();
        post({ type: CONFIG, ...configRef.current });
        return;
      }
      if (type === TARGET) {
        const target = readTarget(event.data);
        if (target) onTargetRef.current(target);
        return;
      }
      const key = type === KEY ? readKey(event.data) : null;
      if (key) window.dispatchEvent(new KeyboardEvent('keydown', { ...key, cancelable: true }));
    };
    const unsubscribeStore = useContentPreviewStore.subscribe((state, previous) => {
      if (
        state.entryOverrides !== previous.entryOverrides ||
        state.recordOverrides !== previous.recordOverrides ||
        state.layoutOverride !== previous.layoutOverride
      ) {
        sendState();
      }
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated' || event.action.type !== 'success') return;
      const root = String(event.query.queryKey[0]);
      if (root !== PREVIEW_CONTENT_QUERY_KEY[0] && !RECORD_QUERY_ROOTS.includes(root)) return;
      clearTimeout(timer);
      timer = setTimeout(() => post({ type: REFRESH }), REFRESH_DELAY_MS);
    });

    window.addEventListener('message', handleMessage);
    return () => {
      clearTimeout(timer);
      unsubscribeStore();
      unsubscribeCache();
      window.removeEventListener('message', handleMessage);
    };
  }, [frame, queryClient]);

  const { isEditing, locale, hasSelection } = config;
  useEffect(() => {
    frame?.contentWindow?.postMessage(
      { type: CONFIG, isEditing, locale, hasSelection },
      window.location.origin,
    );
  }, [frame, isEditing, locale, hasSelection]);
}

const applyFrameLocale = (locale: Locale) => {
  useLocaleStore.setState({ locale });
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
};

export const postToHost = (message: Record<string, unknown>) =>
  window.parent.postMessage(message, window.location.origin);

export const postFrameTarget = (target: FrameTarget) => postToHost({ type: TARGET, target });

export const postFrameKey = (event: KeyboardEvent) =>
  postToHost({
    type: KEY,
    key: event.key,
    code: event.code,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  });

export function useFrameGuest() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<FrameConfig>(NO_CONFIG);

  useEffect(() => {
    document.documentElement.style.scrollbarWidth = 'none';
    const origin = window.location.origin;
    const ownLocale = useLocaleStore.getState().locale;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== window.parent) return;
      const type = messageType(event.data);
      if (type === REFRESH) {
        void queryClient.invalidateQueries({ queryKey: PREVIEW_CONTENT_QUERY_KEY });
        void refreshRecordQueries(queryClient);
        return;
      }
      if (type === CONFIG) {
        const next = readConfig(event.data);
        if (!next) return;
        applyFrameLocale(next.locale ?? ownLocale);
        setConfig(next);
        return;
      }
      const state = type === STATE ? readState(event.data) : null;
      if (!state) return;
      const preview = useContentPreviewStore.getState();
      preview.setEntryOverrides(state.entryOverrides);
      preview.setRecordOverrides(state.recordOverrides);
      preview.setLayoutOverride(state.layoutOverride);
    };
    window.addEventListener('message', handleMessage);
    postToHost({ type: READY });
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  return config;
}
