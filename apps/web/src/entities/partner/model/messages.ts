import { defineMessages, useLocalized } from '@/shared/i18n';

const PARTNER_MESSAGES = defineMessages({
  en: {
    founded: 'Founded',
    type: 'Type',
    website: 'Official website',
    opensInNewTab: 'opens in a new tab',
  },
  uk: {
    founded: 'Заснування',
    type: 'Тип',
    website: 'Офіційний сайт',
    opensInNewTab: 'відкривається в новій вкладці',
  },
  de: {
    founded: 'Gegründet',
    type: 'Typ',
    website: 'Offizielle Website',
    opensInNewTab: 'öffnet sich in einem neuen Tab',
  },
  fr: {
    founded: 'Fondation',
    type: 'Type',
    website: 'Site officiel',
    opensInNewTab: 's’ouvre dans un nouvel onglet',
  },
  ar: {
    founded: 'التأسيس',
    type: 'النوع',
    website: 'الموقع الرسمي',
    opensInNewTab: 'يفتح في علامة تبويب جديدة',
  },
});

export const usePartnerMessages = () => useLocalized(PARTNER_MESSAGES);
