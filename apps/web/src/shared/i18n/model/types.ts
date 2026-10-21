export const LOCALES = ['en', 'uk'] as const;

export type Locale = (typeof LOCALES)[number];

export type Localized<T> = Record<Locale, T>;

export const DEFAULT_LOCALE: Locale = 'en';

export const INTL_LOCALE: Record<Locale, string> = {
  en: 'en-GB',
  uk: 'uk-UA',
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export const defineMessages = <T>(messages: { en: T; uk: NoInfer<T> }): Localized<T> => messages;

export const mapLocalized = <T, R>(
  source: Localized<T>,
  map: (value: T, locale: Locale) => R,
): Localized<R> => ({
  en: map(source.en, 'en'),
  uk: map(source.uk, 'uk'),
});
