import { defineMessages, useLocalized } from '@/shared/i18n';

const PARTNER_MESSAGES = defineMessages({
  en: {
    founded: 'Founded',
    type: 'Type',
    website: 'Official website',
    opensInNewTab: 'opens in a new tab',
    showOnGlobe: 'Show on globe',
  },
  uk: {
    founded: 'Заснування',
    type: 'Тип',
    website: 'Офіційний сайт',
    opensInNewTab: 'відкривається в новій вкладці',
    showOnGlobe: 'Показати на глобусі',
  },
  de: {
    founded: 'Gegründet',
    type: 'Typ',
    website: 'Offizielle Website',
    opensInNewTab: 'öffnet sich in einem neuen Tab',
    showOnGlobe: 'Auf dem Globus zeigen',
  },
  fr: {
    founded: 'Fondation',
    type: 'Type',
    website: 'Site officiel',
    opensInNewTab: 's’ouvre dans un nouvel onglet',
    showOnGlobe: 'Voir sur le globe',
  },
  ar: {
    founded: 'التأسيس',
    type: 'النوع',
    website: 'الموقع الرسمي',
    opensInNewTab: 'يفتح في علامة تبويب جديدة',
    showOnGlobe: 'عرض على الكرة الأرضية',
  },
});

export const usePartnerMessages = () => useLocalized(PARTNER_MESSAGES);
