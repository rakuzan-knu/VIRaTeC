import { defineMessages, useLocalized } from '@/shared/i18n';

const JOIN_MESSAGES = defineMessages({
  en: {
    opensIn: 'The link opens in',
    opening: 'Opening the link…',
    opensBefore: (minutes: number) =>
      minutes > 0 ? `${minutes} min before the start` : 'At the start of the event',
    days: (count: number) => `${count} d`,
    join: (platform: string | null) => (platform ? `Join on ${platform}` : 'Join the meeting'),
    signIn: 'Sign in to join',
    subscribeFirst: 'The meeting link is available to subscribers.',
    linkSoon: 'The meeting link will be added soon.',
    ended: 'This event has ended.',
    watchRecording: 'Watch the recording',
    cancelled: 'This event has been cancelled.',
  },
  uk: {
    opensIn: 'Посилання відкриється через',
    opening: 'Відкриваємо посилання…',
    opensBefore: (minutes: number) =>
      minutes > 0 ? `За ${minutes} хв до початку` : 'На початку події',
    days: (count: number) => `${count} дн`,
    join: (platform: string | null) =>
      platform ? `Приєднатися в ${platform}` : 'Приєднатися до зустрічі',
    signIn: 'Увійдіть, щоб приєднатися',
    subscribeFirst: 'Посилання на зустріч доступне підписникам.',
    linkSoon: 'Посилання на зустріч додадуть незабаром.',
    ended: 'Цю подію завершено.',
    watchRecording: 'Дивитися запис',
    cancelled: 'Цю подію скасовано.',
  },
  de: {
    opensIn: 'Der Link öffnet sich in',
    opening: 'Link wird geöffnet…',
    opensBefore: (minutes: number) =>
      minutes > 0 ? `${minutes} Min. vor Beginn` : 'Zu Beginn der Veranstaltung',
    days: (count: number) => `${count} T.`,
    join: (platform: string | null) =>
      platform ? `Über ${platform} teilnehmen` : 'An der Besprechung teilnehmen',
    signIn: 'Zum Teilnehmen anmelden',
    subscribeFirst: 'Der Besprechungslink ist für Abonnenten verfügbar.',
    linkSoon: 'Der Besprechungslink wird bald hinzugefügt.',
    ended: 'Diese Veranstaltung ist beendet.',
    watchRecording: 'Aufzeichnung ansehen',
    cancelled: 'Diese Veranstaltung wurde abgesagt.',
  },
  fr: {
    opensIn: 'Le lien s’ouvre dans',
    opening: 'Ouverture du lien…',
    opensBefore: (minutes: number) =>
      minutes > 0 ? `${minutes} min avant le début` : 'Au début de l’événement',
    days: (count: number) => `${count} j`,
    join: (platform: string | null) =>
      platform ? `Rejoindre sur ${platform}` : 'Rejoindre la réunion',
    signIn: 'Connectez-vous pour rejoindre',
    subscribeFirst: 'Le lien de la réunion est réservé aux abonnés.',
    linkSoon: 'Le lien de la réunion sera bientôt ajouté.',
    ended: 'Cet événement est terminé.',
    watchRecording: 'Voir l’enregistrement',
    cancelled: 'Cet événement a été annulé.',
  },
  ar: {
    opensIn: 'يُفتح الرابط خلال',
    opening: 'جارٍ فتح الرابط…',
    opensBefore: (minutes: number) =>
      minutes > 0 ? `قبل البداية بـ ${minutes} دقيقة` : 'عند بداية الفعالية',
    days: (count: number) => `${count} ي`,
    join: (platform: string | null) =>
      platform ? `الانضمام عبر ${platform}` : 'الانضمام إلى الاجتماع',
    signIn: 'سجّل الدخول للانضمام',
    subscribeFirst: 'رابط الاجتماع متاح للمشتركين.',
    linkSoon: 'ستتم إضافة رابط الاجتماع قريبًا.',
    ended: 'انتهت هذه الفعالية.',
    watchRecording: 'مشاهدة التسجيل',
    cancelled: 'أُلغيت هذه الفعالية.',
  },
});

export const useJoinMessages = () => useLocalized(JOIN_MESSAGES);
