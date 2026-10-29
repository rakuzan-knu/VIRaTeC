import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ContentFields, RecordData } from '@viratec/contracts';
import {
  PREVIEW_CONTENT_QUERY_KEY,
  RECORD_QUERY_ROOTS,
  useContentPreviewStore,
  type PageLayoutOverride,
} from '@/shared/lib';
import { refreshRecordQueries } from './queries';

export const EDITOR_FRAME_NAME = 'viratec-editor-frame';

const MESSAGE_PREFIX = 'viratec-editor:';
const READY = `${MESSAGE_PREFIX}ready`;
const STATE = `${MESSAGE_PREFIX}state`;
const REFRESH = `${MESSAGE_PREFIX}refresh`;
const REFRESH_DELAY_MS = 300;

export const isEditorFrame = () =>
  typeof window !== 'undefined' && window.name === EDITOR_FRAME_NAME;

interface FrameState {
  entryOverrides: Record<string, ContentFields>;
  recordOverrides: Record<string, RecordData>;
  layoutOverride: PageLayoutOverride | null;
}

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

const currentState = (): FrameState => {
  const { entryOverrides, recordOverrides, layoutOverride } = useContentPreviewStore.getState();
  return { entryOverrides, recordOverrides, layoutOverride };
};

export function useFrameHost(frame: HTMLIFrameElement | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!frame) return;
    const origin = window.location.origin;
    const post = (message: Record<string, unknown>) =>
      frame.contentWindow?.postMessage(message, origin);
    const sendState = () => post({ type: STATE, ...currentState() });

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== frame.contentWindow) return;
      if (messageType(event.data) === READY) sendState();
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
}

export function useFrameGuest() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const origin = window.location.origin;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.source !== window.parent) return;
      const type = messageType(event.data);
      if (type === REFRESH) {
        void queryClient.invalidateQueries({ queryKey: PREVIEW_CONTENT_QUERY_KEY });
        void refreshRecordQueries(queryClient);
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
    window.parent.postMessage({ type: READY }, origin);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);
}
