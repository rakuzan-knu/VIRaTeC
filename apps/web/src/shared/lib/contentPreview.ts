import { create } from 'zustand';
import type { ContentIssue } from '../../../build-tools/contentful/entry-reader.ts';
import type { LayoutPage, PageSectionItem } from '@/shared/config/pageLayout';
import { SITE_EDITOR_STORAGE_KEY } from '@/shared/config/storageKeys';
import type { Locale } from '@/shared/i18n';

export type { ContentIssue };

export interface ContentFieldAddress {
  entryId: string;
  contentTypeId: string;
  fieldId: string;
  locale: Locale;
}

export type ContentAssetAddress = Omit<ContentFieldAddress, 'locale'>;

const MARK_START = '⁣';
const MARK_END = '⁤';
const MARK_DIGITS = ['​', '‌', '‍'] as const;
const MARK_PATTERN = /⁣([​-‍]+)⁤/g;

const addresses: ContentFieldAddress[] = [];
const addressIndex = new Map<string, number>();
const assetAddresses = new Map<string, ContentAssetAddress>();

const addressKey = ({ entryId, fieldId, locale }: ContentFieldAddress) =>
  `${entryId}:${fieldId}:${locale}`;

export const encodeFieldMark = (address: ContentFieldAddress) => {
  const key = addressKey(address);
  let index = addressIndex.get(key);
  if (index === undefined) {
    index = addresses.push(address) - 1;
    addressIndex.set(key, index);
  }
  return `${MARK_START}${index
    .toString(MARK_DIGITS.length)
    .split('')
    .map((digit) => MARK_DIGITS[Number(digit)])
    .join('')}${MARK_END}`;
};

export const decodeFieldMarks = (text: string): ContentFieldAddress[] => {
  const found = new Map<number, ContentFieldAddress>();
  for (const match of text.matchAll(MARK_PATTERN)) {
    const digits = [...(match[1] ?? '')]
      .map((char) => MARK_DIGITS.indexOf(char as (typeof MARK_DIGITS)[number]))
      .join('');
    const index = Number.parseInt(digits, MARK_DIGITS.length);
    const address = addresses[index];
    if (address) found.set(index, address);
  }
  return [...found.values()];
};

export const stripFieldMarks = (text: string) => text.replace(MARK_PATTERN, '');

export const registerAssetAddress = (assetId: string, address: ContentAssetAddress) => {
  assetAddresses.set(assetId, address);
};

export const findAssetAddress = (assetId: string) => assetAddresses.get(assetId);

const readEnabled = () => {
  try {
    return typeof window !== 'undefined' && sessionStorage.getItem(SITE_EDITOR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const writeEnabled = (enabled: boolean) => {
  try {
    if (enabled) sessionStorage.setItem(SITE_EDITOR_STORAGE_KEY, '1');
    else sessionStorage.removeItem(SITE_EDITOR_STORAGE_KEY);
  } catch {
    return;
  }
};

export interface ActivePageLayout {
  page: LayoutPage;
  entryId: string | null;
}

export interface PageLayoutOverride {
  page: LayoutPage;
  sections: PageSectionItem[];
}

interface ContentPreviewState {
  enabled: boolean;
  issues: Record<string, readonly ContentIssue[]>;
  activeLayout: ActivePageLayout | null;
  layoutOverride: PageLayoutOverride | null;
  setEnabled: (enabled: boolean) => void;
  setIssues: (domainId: string, issues: readonly ContentIssue[]) => void;
  setActiveLayout: (layout: ActivePageLayout | null) => void;
  setLayoutOverride: (override: PageLayoutOverride | null) => void;
}

export const useContentPreviewStore = create<ContentPreviewState>((set) => ({
  enabled: readEnabled(),
  issues: {},
  activeLayout: null,
  layoutOverride: null,
  setEnabled: (enabled) => {
    writeEnabled(enabled);
    set({ enabled, issues: {}, layoutOverride: null });
  },
  setActiveLayout: (activeLayout) => set({ activeLayout }),
  setLayoutOverride: (layoutOverride) => set({ layoutOverride }),
  setIssues: (domainId, issues) =>
    set((state) => ({ issues: { ...state.issues, [domainId]: issues } })),
}));
