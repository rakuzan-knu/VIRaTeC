import { EventNotificationKind } from '@prisma/client';
import { CONTENT_LOCALE_KEYS, type ContentLocaleKey } from '@viratec/contracts';

interface KindCopy {
  subject: (title: string) => string;
  lead: string;
  action: string;
}

interface MailCopy {
  kinds: Record<EventNotificationKind, KindCopy>;
  when: string;
  reason: string;
  footer: string;
  unsubscribe: string;
}

const COPY: Record<ContentLocaleKey, MailCopy> = {
  en: {
    kinds: {
      JOIN_OPEN: {
        subject: (title) => `You can join now: ${title}`,
        lead: 'The meeting link is open. Join whenever you are ready.',
        action: 'Join the meeting',
      },
      RESCHEDULED: {
        subject: (title) => `New time: ${title}`,
        lead: 'The time of this event has changed.',
        action: 'Open the event page',
      },
      CANCELLED: {
        subject: (title) => `Cancelled: ${title}`,
        lead: 'This event has been cancelled.',
        action: 'Open the event page',
      },
    },
    when: 'When',
    reason: 'Reason',
    footer: 'You received this email because you subscribed to this event on VIRaTeC.',
    unsubscribe: 'Unsubscribe from this event',
  },
  uk: {
    kinds: {
      JOIN_OPEN: {
        subject: (title) => `Можна заходити: ${title}`,
        lead: 'Посилання на зустріч відкрито. Приєднуйтеся, коли будете готові.',
        action: 'Приєднатися до зустрічі',
      },
      RESCHEDULED: {
        subject: (title) => `Новий час: ${title}`,
        lead: 'Час цієї події змінено.',
        action: 'Відкрити сторінку події',
      },
      CANCELLED: {
        subject: (title) => `Скасовано: ${title}`,
        lead: 'Цю подію скасовано.',
        action: 'Відкрити сторінку події',
      },
    },
    when: 'Коли',
    reason: 'Причина',
    footer: 'Ви отримали цього листа, бо підписалися на цю подію у VIRaTeC.',
    unsubscribe: 'Відписатися від цієї події',
  },
  de: {
    kinds: {
      JOIN_OPEN: {
        subject: (title) => `Sie können jetzt teilnehmen: ${title}`,
        lead: 'Der Besprechungslink ist geöffnet. Treten Sie bei, sobald Sie bereit sind.',
        action: 'An der Besprechung teilnehmen',
      },
      RESCHEDULED: {
        subject: (title) => `Neuer Termin: ${title}`,
        lead: 'Der Termin dieser Veranstaltung hat sich geändert.',
        action: 'Veranstaltungsseite öffnen',
      },
      CANCELLED: {
        subject: (title) => `Abgesagt: ${title}`,
        lead: 'Diese Veranstaltung wurde abgesagt.',
        action: 'Veranstaltungsseite öffnen',
      },
    },
    when: 'Wann',
    reason: 'Grund',
    footer: 'Sie erhalten diese E-Mail, weil Sie diese Veranstaltung bei VIRaTeC abonniert haben.',
    unsubscribe: 'Von dieser Veranstaltung abmelden',
  },
  fr: {
    kinds: {
      JOIN_OPEN: {
        subject: (title) => `Vous pouvez rejoindre : ${title}`,
        lead: 'Le lien de la réunion est ouvert. Rejoignez-la dès que vous êtes prêt.',
        action: 'Rejoindre la réunion',
      },
      RESCHEDULED: {
        subject: (title) => `Nouvel horaire : ${title}`,
        lead: "L'horaire de cet événement a changé.",
        action: "Ouvrir la page de l'événement",
      },
      CANCELLED: {
        subject: (title) => `Annulé : ${title}`,
        lead: 'Cet événement a été annulé.',
        action: "Ouvrir la page de l'événement",
      },
    },
    when: 'Quand',
    reason: 'Motif',
    footer: 'Vous recevez cet e-mail car vous êtes inscrit à cet événement sur VIRaTeC.',
    unsubscribe: 'Se désinscrire de cet événement',
  },
  ar: {
    kinds: {
      JOIN_OPEN: {
        subject: (title) => `يمكنك الانضمام الآن: ${title}`,
        lead: 'رابط الاجتماع مفتوح. انضم عندما تكون مستعدًا.',
        action: 'الانضمام إلى الاجتماع',
      },
      RESCHEDULED: {
        subject: (title) => `موعد جديد: ${title}`,
        lead: 'تغيّر موعد هذه الفعالية.',
        action: 'فتح صفحة الفعالية',
      },
      CANCELLED: {
        subject: (title) => `أُلغيت: ${title}`,
        lead: 'أُلغيت هذه الفعالية.',
        action: 'فتح صفحة الفعالية',
      },
    },
    when: 'الموعد',
    reason: 'السبب',
    footer: 'وصلتك هذه الرسالة لأنك اشتركت في هذه الفعالية على VIRaTeC.',
    unsubscribe: 'إلغاء الاشتراك في هذه الفعالية',
  },
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

const singleLine = (value: string) => value.replace(/\s+/g, ' ').trim();

export const mailLocaleOf = (locale: string): ContentLocaleKey =>
  CONTENT_LOCALE_KEYS.find((key) => key === locale) ?? 'en';

export interface EventMailInput {
  kind: EventNotificationKind;
  locale: string;
  timeZone: string;
  title: string;
  startDate: Date;
  cancelReason: string | null;
  meetingUrl: string | null;
  pageUrl: string;
  unsubscribeUrl: string;
}

export function buildEventMail(input: EventMailInput) {
  const locale = mailLocaleOf(input.locale);
  const copy = COPY[locale];
  const kind = copy.kinds[input.kind];
  const title = singleLine(input.title);
  const when = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: input.timeZone,
    timeZoneName: 'short',
  }).format(input.startDate);
  const reason =
    input.kind === EventNotificationKind.CANCELLED && input.cancelReason?.trim()
      ? input.cancelReason.trim()
      : null;
  const actionUrl =
    input.kind === EventNotificationKind.JOIN_OPEN && input.meetingUrl
      ? input.meetingUrl
      : input.pageUrl;
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  const text = [
    kind.lead,
    '',
    title,
    `${copy.when}: ${when}`,
    ...(reason ? [`${copy.reason}: ${reason}`] : []),
    '',
    `${kind.action}: ${actionUrl}`,
    '',
    '---',
    copy.footer,
    `${copy.unsubscribe}: ${input.unsubscribeUrl}`,
  ].join('\n');

  const reasonRow = reason
    ? `<p style="margin:0 0 16px;color:#44506a;font-size:15px;line-height:22px">${escapeHtml(copy.reason)}: ${escapeHtml(reason)}</p>`
    : '';

  const html = `<!doctype html>
<html lang="${locale}" dir="${direction}">
<body style="margin:0;padding:24px 12px;background:#f2f4f8;font-family:Arial,Helvetica,sans-serif;color:#03122e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px"><tr><td style="padding:32px 28px" dir="${direction}">
<p style="margin:0 0 20px;font-size:18px;font-weight:bold;color:#03122e">VIRaTeC</p>
<p style="margin:0 0 20px;color:#44506a;font-size:15px;line-height:22px">${escapeHtml(kind.lead)}</p>
<h1 style="margin:0 0 8px;font-size:22px;line-height:28px;color:#03122e">${escapeHtml(title)}</h1>
<p style="margin:0 0 16px;color:#44506a;font-size:15px;line-height:22px">${escapeHtml(copy.when)}: ${escapeHtml(when)}</p>
${reasonRow}<p style="margin:24px 0"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:14px 24px;background:#b5fa67;border-radius:8px;color:#03122e;font-size:15px;font-weight:bold;text-decoration:none">${escapeHtml(kind.action)}</a></p>
<p style="margin:0 0 8px;color:#6a7488;font-size:13px;line-height:18px">${escapeHtml(copy.footer)}</p>
<p style="margin:0"><a href="${escapeHtml(input.unsubscribeUrl)}" style="color:#6a7488;font-size:13px;line-height:18px">${escapeHtml(copy.unsubscribe)}</a></p>
</td></tr></table>
</td></tr></table>
</body>
</html>`;

  return { subject: singleLine(kind.subject(title)), text, html };
}
