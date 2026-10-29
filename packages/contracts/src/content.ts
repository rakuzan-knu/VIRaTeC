export const CONTENT_EDITOR_LIMITS = {
  maxFieldsBytes: 256 * 1024,
  maxAssetBytes: 3 * 1024 * 1024,
  assetMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  maxPublishBatch: 50,
} as const;

export type ContentAssetMimeType = (typeof CONTENT_EDITOR_LIMITS.assetMimeTypes)[number];

export type ContentFields = Record<string, Record<string, unknown>>;

export interface ContentLocales {
  en: string;
  uk: string;
}

export type ContentLocaleKey = keyof ContentLocales;

export const TRANSLATION_LIMITS = { maxTexts: 20, maxTextLength: 4000 } as const;

export interface TranslateContentRequestDto {
  from: ContentLocaleKey;
  to: ContentLocaleKey;
  texts: string[];
}

export interface TranslateContentResultDto {
  translations: string[];
}

export interface ContentEntryDto {
  id: string;
  contentTypeId: string;
  version: number;
  publishedVersion: number | null;
  updatedAt: string;
  fields: ContentFields;
  locales: ContentLocales;
}

export interface ContentReferenceDto {
  id: string;
  contentTypeId: string;
  fields: ContentFields;
}

export interface SaveContentEntryRequestDto {
  version: number;
  fields: ContentFields;
  label?: string;
}

export interface CreateContentEntryRequestDto {
  contentTypeId: string;
  fields: ContentFields;
  label?: string;
}

export interface UploadContentAssetRequestDto {
  fileName: string;
  title: string;
  data: string;
}

export interface ContentAssetDto {
  id: string;
  url: string;
  title: string;
}

export type ContentResourceKind = 'ENTRY' | 'ASSET' | 'PROJECT' | 'EVENT' | 'PUBLICATION';

export type ContentRevisionSource = 'site' | 'contentful';

export const CONTENT_REVISION_LIMIT = 30;

export interface ContentRevisionDto {
  id: string;
  source: ContentRevisionSource;
  createdAt: string;
  label: string | null;
  actor: { id: string; name: string } | null;
  data: Record<string, unknown>;
}

export interface RestoreContentRevisionRequestDto {
  resourceType: Exclude<ContentResourceKind, 'ASSET'>;
  resourceId: string;
  revisionId: string;
  label?: string;
}

export interface ContentChangeDto {
  id: string;
  resourceType: ContentResourceKind;
  resourceId: string;
  contentTypeId: string | null;
  label: string | null;
  isNew: boolean;
  fieldIds: string[];
  isDeleted: boolean;
  actor: { id: string; name: string } | null;
  updatedAt: string;
}

export interface PublishContentRequestDto {
  changeIds?: string[];
}

export interface PublishContentResultDto {
  published: string[];
  failed: { changeId: string; label: string | null; reason: string }[];
}
