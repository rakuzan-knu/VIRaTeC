import { useNavigate } from 'react-router-dom';
import { useLocale, useLocaleStore, type Locale } from '@/shared/i18n';
import {
  hasEnglishPage,
  isEnglishPath,
  stripEnglishPrefix,
  toEnglishPath,
} from '@/shared/config/routes';

const targetPath = (pathname: string, locale: Locale) => {
  if (locale !== 'en') return isEnglishPath(pathname) ? stripEnglishPrefix(pathname) : null;
  return !isEnglishPath(pathname) && hasEnglishPage(pathname) ? toEnglishPath(pathname) : null;
};

export function useLanguageSwitch() {
  const locale = useLocale();
  const setLocale = useLocaleStore((state) => state.setLocale);
  const navigate = useNavigate();

  const switchLanguage = (next: Locale) => {
    const { pathname, search, hash } = window.location;
    const target = targetPath(pathname, next);
    if (!target) {
      setLocale(next);
      return;
    }
    void Promise.resolve(navigate({ pathname: target, search, hash })).then(() => setLocale(next));
  };

  return { locale, switchLanguage };
}
