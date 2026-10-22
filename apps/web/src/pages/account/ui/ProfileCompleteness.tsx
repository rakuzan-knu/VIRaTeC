import type { AccountDto } from '@viratec/contracts';
import { defineMessages, useLocalized } from '@/shared/i18n';

const COMPLETENESS_MESSAGES = defineMessages({
  en: {
    title: (percent: number) => `Your profile is ${percent}% complete`,
    hint: 'Complete profiles are easier for other members to find — add:',
    items: {
      avatar: 'a photo',
      bio: 'a short bio',
      skills: 'research interests',
      studies: 'your academic status',
      institution: 'university',
      country: 'country',
      languages: 'languages',
      links: 'an academic profile link',
      openTo: 'what you are open to',
    },
  },
  uk: {
    title: (percent: number) => `Профіль заповнено на ${percent}%`,
    hint: 'Заповнені профілі легше знайти в спільноті — додайте:',
    items: {
      avatar: 'фото',
      bio: 'короткий опис',
      skills: 'дослідницькі інтереси',
      studies: 'академічний статус',
      institution: 'університет',
      country: 'країну',
      languages: 'мови',
      links: 'посилання на академічний профіль',
      openTo: 'до чого ви відкриті',
    },
  },
});

type CompletenessItem = keyof (typeof COMPLETENESS_MESSAGES)['en']['items'];

const CHECKS: Record<CompletenessItem, (account: AccountDto) => boolean> = {
  avatar: (account) => Boolean(account.avatarUrl),
  bio: (account) => Boolean(account.bio),
  skills: (account) => (account.skills?.length ?? 0) > 0,
  studies: (account) => Boolean(account.studyLevel),
  institution: (account) => Boolean(account.institution),
  country: (account) => Boolean(account.country),
  languages: (account) => (account.languages?.length ?? 0) > 0,
  links: (account) => Object.values(account.links ?? {}).some(Boolean),
  openTo: (account) => (account.openTo?.length ?? 0) > 0,
};

const ITEMS = Object.keys(CHECKS) as CompletenessItem[];

interface ProfileCompletenessProps {
  account: AccountDto;
}

export function ProfileCompleteness({ account }: ProfileCompletenessProps) {
  const t = useLocalized(COMPLETENESS_MESSAGES);
  const missing = ITEMS.filter((item) => !CHECKS[item](account));
  if (missing.length === 0) return null;

  const percent = Math.round(((ITEMS.length - missing.length) / ITEMS.length) * 100);

  return (
    <section className="flex flex-col gap-3 rounded-[24px] border border-viratec-lime/20 bg-viratec-lime/6 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-medium text-white">{t.title(percent)}</h3>
        <span className="text-sm font-medium text-viratec-accent">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={t.title(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-viratec-lime to-viratec-cyan transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm leading-5 text-viratec-muted">
        {t.hint}{' '}
        <span className="text-viratec-soft">{missing.map((item) => t.items[item]).join(', ')}</span>
      </p>
    </section>
  );
}
