export const LOCALES = ['en', 'uk', 'de', 'fr', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export type Localized<T> = { en: T } & Partial<Record<Exclude<Locale, 'en'>, T>>;

export type Messages<T> = Record<Locale, T>;

export const DEFAULT_LOCALE: Locale = 'en';

export const RTL_LOCALES: readonly Locale[] = ['ar'];

export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська',
  de: 'Deutsch',
  fr: 'Français',
  ar: 'العربية',
};

export const INTL_LOCALE: Record<Locale, string> = {
  en: 'en-GB',
  uk: 'uk-UA',
  de: 'de-DE',
  fr: 'fr-FR',
  ar: 'ar',
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export const defineMessages = <T>(messages: {
  en: T;
  uk: NoInfer<T>;
  de: NoInfer<T>;
  fr: NoInfer<T>;
  ar: NoInfer<T>;
}): Messages<T> => messages;

export const mapLocalized = <T, R>(
  source: Messages<T>,
  map: (value: T, locale: Locale) => R,
): Messages<R> => ({
  en: map(source.en, 'en'),
  uk: map(source.uk, 'uk'),
  de: map(source.de, 'de'),
  fr: map(source.fr, 'fr'),
  ar: map(source.ar, 'ar'),
});

export const fromLocales = <T>(read: (locale: Locale) => T): Messages<T> => ({
  en: read('en'),
  uk: read('uk'),
  de: read('de'),
  fr: read('fr'),
  ar: read('ar'),
});

export const pickLocalized = <T>(source: Localized<T>, locale: Locale): T =>
  source[locale] ?? source.en;
