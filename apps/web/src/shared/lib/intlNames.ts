import { useMemo } from 'react';
import { INTL_LOCALE, useLocale } from '../i18n';

export const LANGUAGE_CODES = [
  'uk',
  'en',
  'de',
  'fr',
  'es',
  'it',
  'pl',
  'pt',
  'cs',
  'sk',
  'ro',
  'hu',
  'bg',
  'hr',
  'sr',
  'sl',
  'lt',
  'lv',
  'et',
  'fi',
  'sv',
  'no',
  'da',
  'nl',
  'el',
  'tr',
  'ka',
  'hy',
  'az',
  'kk',
  'he',
  'ar',
  'fa',
  'hi',
  'bn',
  'ur',
  'ta',
  'zh',
  'ja',
  'ko',
  'vi',
  'th',
  'id',
  'ms',
  'sw',
  'ru',
] as const;

export const COUNTRY_CODES = [
  'UA',
  'AE',
  'AL',
  'AM',
  'AR',
  'AT',
  'AU',
  'AZ',
  'BA',
  'BE',
  'BG',
  'BR',
  'BY',
  'CA',
  'CH',
  'CL',
  'CN',
  'CO',
  'CY',
  'CZ',
  'DE',
  'DK',
  'DZ',
  'EE',
  'EG',
  'ES',
  'FI',
  'FR',
  'GB',
  'GE',
  'GR',
  'HR',
  'HU',
  'ID',
  'IE',
  'IL',
  'IN',
  'IS',
  'IT',
  'JO',
  'JP',
  'KE',
  'KR',
  'KZ',
  'LB',
  'LT',
  'LU',
  'LV',
  'MA',
  'MD',
  'ME',
  'MK',
  'MT',
  'MX',
  'MY',
  'NG',
  'NL',
  'NO',
  'NZ',
  'PE',
  'PH',
  'PK',
  'PL',
  'PT',
  'QA',
  'RO',
  'RS',
  'SA',
  'SE',
  'SG',
  'SI',
  'SK',
  'TH',
  'TN',
  'TR',
  'TW',
  'US',
  'UZ',
  'VN',
  'ZA',
] as const;

const createDisplayNames = (locale: string, type: 'language' | 'region') => {
  try {
    return new Intl.DisplayNames([locale], { type });
  } catch {
    return null;
  }
};

const capitalize = (value: string) => value.charAt(0).toLocaleUpperCase() + value.slice(1);

export function useIntlNames() {
  const locale = INTL_LOCALE[useLocale()];

  return useMemo(() => {
    const languages = createDisplayNames(locale, 'language');
    const regions = createDisplayNames(locale, 'region');
    const collator = new Intl.Collator(locale);
    const languageName = (code: string) => capitalize(languages?.of(code) ?? code);
    const countryName = (code: string) => regions?.of(code) ?? code;
    const sortBy = <T extends string>(codes: readonly T[], name: (code: T) => string) =>
      [...codes].sort((a, b) => collator.compare(name(a), name(b)));

    return {
      languageName,
      countryName,
      languageOptions: sortBy(LANGUAGE_CODES, languageName).map((code) => ({
        value: code,
        label: languageName(code),
      })),
      countryOptions: sortBy(COUNTRY_CODES, countryName).map((code) => ({
        value: code,
        label: countryName(code),
      })),
    };
  }, [locale]);
}
