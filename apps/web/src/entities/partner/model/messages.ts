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
});

export const usePartnerMessages = () => useLocalized(PARTNER_MESSAGES);
