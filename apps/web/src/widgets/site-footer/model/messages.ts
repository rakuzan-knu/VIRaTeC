import { defineMessages, mapLocalized } from '@/shared/i18n';
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
});

export const FOOTER_MESSAGES = mapLocalized(FOOTER_LABELS, (labels, locale) => ({
  ...labels,
  ...SITE_SETTINGS.footer[locale],
}));
