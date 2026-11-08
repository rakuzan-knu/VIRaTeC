import { defineMessages, mapLocalized, pickLocalized } from '@/shared/i18n';
import { SITE_SETTINGS } from '@/shared/config/site';

const FOOTER_LABELS = defineMessages({
  en: {
    language: 'Language',
    followUs: 'Follow us',
    contact: 'Contact',
    keyboardShortcuts: 'Keyboard shortcuts',
  },
  uk: {
    language: 'Мова',
    followUs: 'Ми в соцмережах',
    contact: 'Контакти',
    keyboardShortcuts: 'Гарячі клавіші',
  },
  de: {
    language: 'Sprache',
    followUs: 'Folgen Sie uns',
    contact: 'Kontakt',
    keyboardShortcuts: 'Tastenkürzel',
  },
  fr: {
    language: 'Langue',
    followUs: 'Suivez-nous',
    contact: 'Contact',
    keyboardShortcuts: 'Raccourcis clavier',
  },
  ar: {
    language: 'اللغة',
    followUs: 'تابعونا',
    contact: 'اتصل بنا',
    keyboardShortcuts: 'اختصارات لوحة المفاتيح',
  },
});

export const FOOTER_MESSAGES = mapLocalized(FOOTER_LABELS, (labels, locale) => ({
  ...labels,
  ...pickLocalized(SITE_SETTINGS.footer, locale),
}));
