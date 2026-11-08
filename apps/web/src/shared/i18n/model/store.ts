import { create } from 'zustand';
import { PRERENDER_LOCALE } from '@/shared/config/prerender';
import { isEnglishPath } from '@/shared/config/routes';
import { LOCALE_STORAGE_KEY as STORAGE_KEY } from '@/shared/config/storageKeys';
import {
  DEFAULT_LOCALE,
  LOCALES,
  RTL_LOCALES,
  isLocale,
  pickLocalized,
  type Locale,
  type Localized,
} from './types';

const readStoredLocale = (): Locale | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
};

const writeStoredLocale = (locale: Locale) => {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    return;
  }
};

export const clearStoredLocale = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
};

const detectLocale = (): Locale => {
  if (import.meta.env.SSR) return PRERENDER_LOCALE;
  if (isEnglishPath(window.location.pathname)) return 'en';
  const stored = readStoredLocale();
  if (stored) return stored;
  const browser = navigator.language.toLowerCase();
  return LOCALES.find((locale) => browser.startsWith(locale)) ?? DEFAULT_LOCALE;
};

const applyDocumentLocale = (locale: Locale) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
};

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const initialLocale = detectLocale();
applyDocumentLocale(initialLocale);

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: initialLocale,
  setLocale: (locale) => {
    writeStoredLocale(locale);
    applyDocumentLocale(locale);
    set({ locale });
  },
}));

const useStoreLocale = () => useLocaleStore((state) => state.locale);

const usePrerenderLocale = () => useLocaleStore.getState().locale;

export const useLocale = import.meta.env.SSR ? usePrerenderLocale : useStoreLocale;

export const useLocalized = <T>(messages: Localized<T>): T => pickLocalized(messages, useLocale());
