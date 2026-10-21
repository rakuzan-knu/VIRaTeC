import { create } from 'zustand';
import { DEFAULT_LOCALE, isLocale, type Locale } from './types';

const STORAGE_KEY = 'viratec_locale';

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
  const stored = readStoredLocale();
  if (stored) return stored;
  return navigator.language.toLowerCase().startsWith('uk') ? 'uk' : DEFAULT_LOCALE;
};

const applyDocumentLocale = (locale: Locale) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
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

export const useLocale = () => useLocaleStore((state) => state.locale);

export const useLocalized = <T>(messages: Record<Locale, T>): T => messages[useLocale()];
