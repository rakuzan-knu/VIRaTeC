import { useCallback, useDeferredValue } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  LOCALE_PLACEHOLDER,
  RECORD_DEFINITIONS,
  readRecordValue,
  recordTypeId,
  type RecordData,
  type RecordDraftDto,
  type RecordResource,
} from '@viratec/contracts';
import { api } from '@/shared/api/apiClient';
import { LOCALES } from '@/shared/i18n';
import {
  contentAssetIdFromUrl,
  encodeFieldMark,
  registerAssetAddress,
  useContentPreviewStore,
} from './contentPreview';

export const RECORD_QUERY_ROOTS: readonly string[] = ['projects', 'publications', 'events'];

let drafts: Promise<RecordDraftDto[]> | null = null;

export const invalidateRecordDrafts = () => {
  drafts = null;
};

const loadDrafts = () =>
  (drafts ??= api.get<RecordDraftDto[]>('/admin/records/drafts').catch(() => {
    drafts = null;
    return [];
  }));

const MARKED_KINDS = new Set(['text', 'longText', 'blocks']);

const MARKED_BLOCK_KEYS = new Set(['text', 'author', 'caption']);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const updateAt = (
  target: unknown,
  keys: readonly string[],
  update: (value: unknown) => unknown,
): unknown => {
  const [key, ...rest] = keys;
  if (key === undefined) return update(target);
  if (!isObject(target) || !(key in target)) return target;
  return { ...target, [key]: updateAt(target[key], rest, update) };
};

const markValue = (value: unknown, marker: string): unknown => {
  if (typeof value === 'string') return value.trim() ? `${value}${marker}` : value;
  if (Array.isArray(value)) {
    return value.map((block) =>
      isObject(block)
        ? Object.fromEntries(
            Object.entries(block).map(([key, item]) => [
              key,
              MARKED_BLOCK_KEYS.has(key) && typeof item === 'string' && item.trim()
                ? `${item}${marker}`
                : item,
            ]),
          )
        : block,
    );
  }
  return value;
};

const markRecord = <T>(resource: RecordResource, key: string, item: T): T => {
  let marked: unknown = item;
  for (const field of RECORD_DEFINITIONS[resource].fields) {
    const value = field.localized ? undefined : readRecordValue(item, field.path);
    const assetId = typeof value === 'string' ? contentAssetIdFromUrl(value) : null;
    if (assetId) {
      registerAssetAddress(assetId, {
        entryId: key,
        contentTypeId: recordTypeId(resource),
        fieldId: field.path,
      });
    }
    if (!field.localized || !MARKED_KINDS.has(field.kind)) continue;
    for (const locale of LOCALES) {
      const marker = encodeFieldMark({
        entryId: key,
        contentTypeId: recordTypeId(resource),
        fieldId: field.path,
        locale,
      });
      const path = field.path.replace(LOCALE_PLACEHOLDER, locale).split('.');
      marked = updateAt(marked, path, (value) => markValue(value, marker));
    }
  }
  return marked as T;
};

interface RecordPreviewOptions<T> {
  resource: RecordResource;
  keyOf: (item: T) => string;
  merge: (item: T, data: RecordData) => T;
  create?: (key: string, data: RecordData) => T;
}

export async function previewRecords<T>(
  items: readonly T[],
  { resource, keyOf, merge, create }: RecordPreviewOptions<T>,
): Promise<T[]> {
  if (!useContentPreviewStore.getState().enabled) return [...items];
  const own = (await loadDrafts()).filter((draft) => draft.resource === resource);
  const byKey = new Map(own.map((draft) => [draft.key, draft]));

  const merged = items.flatMap((item) => {
    const draft = byKey.get(keyOf(item));
    if (draft?.isDeleted) return [];
    return [draft ? merge(item, draft.data) : item];
  });
  if (create) {
    for (const draft of own) {
      if (draft.isNew && !draft.isDeleted) merged.push(create(draft.key, draft.data));
    }
  }
  return merged.map((item) => markRecord(resource, keyOf(item), item));
}

type RecordOverlayOptions<T> = Pick<RecordPreviewOptions<T>, 'resource' | 'keyOf' | 'merge'>;

const NO_RECORD_OVERRIDES: Record<string, RecordData> = {};

const pickRecordOverrides = (overrides: Record<string, RecordData>, resource: RecordResource) => {
  const prefix = `${resource}:`;
  const picked = Object.entries(overrides).filter(([key]) => key.startsWith(prefix));
  return picked.length > 0
    ? Object.fromEntries(picked.map(([key, data]) => [key.slice(prefix.length), data]))
    : NO_RECORD_OVERRIDES;
};

export function useRecordOverlay<T>({ resource, keyOf, merge }: RecordOverlayOptions<T>) {
  const overrides = useDeferredValue(
    useContentPreviewStore(
      useShallow((state) => pickRecordOverrides(state.recordOverrides, resource)),
    ),
  );
  return useCallback(
    (items: readonly T[]): T[] =>
      overrides === NO_RECORD_OVERRIDES
        ? [...items]
        : items.map((item) => {
            const key = keyOf(item);
            const data = overrides[key];
            return data ? merge(item, markRecord(resource, key, data)) : item;
          }),
    [overrides, resource, keyOf, merge],
  );
}
