import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  ImageOff,
  LoaderCircle,
  MonitorSmartphone,
  UserPen,
} from 'lucide-react';
import type { AccountDto } from '@viratec/contracts';
import { useDeleteAvatar } from '@/features/update-avatar';
import { useClearProfileDetails } from '@/features/update-profile';
import { useClearSaved, useSavedItems } from '@/features/save-item';
import { useEraseOtherSessions, useSessions } from '@/features/manage-sessions';
import { buildAccountPath } from '@/shared/config/routes';
import { defineMessages, useLocalized } from '@/shared/i18n';
import { cn } from '@/shared/lib';

const DATA_CONTROLS_MESSAGES = defineMessages({
  en: {
    intro:
      'Remove individual pieces of your data without deleting the account. Deletion is permanent and takes effect immediately.',
    photo: 'Profile photo',
    photoHas: 'Your uploaded or Google photo is stored and shown on your profile.',
    photoNone: 'No photo stored.',
    photoAction: 'Delete photo',
    details: 'Profile details',
    detailsHint:
      'Bio, department, interests, academic status, university, country, languages, academic links and “Open to”. Your name and faculty stay, as the account needs them.',
    detailsAction: 'Clear details',
    saved: 'Saved items',
    savedCount: (count: number) =>
      count === 0 ? 'Nothing saved.' : `${count} saved ${count === 1 ? 'item' : 'items'}.`,
    savedAction: 'Clear saved',
    sessions: 'Other devices and sign-in history',
    sessionsCount: (count: number) =>
      count === 0
        ? 'Only this device is signed in.'
        : `${count} other ${count === 1 ? 'device is' : 'devices are'} signed in. Their IP addresses and browser details are stored.`,
    sessionsAction: 'Sign out and erase',
    confirm: 'Confirm',
    cancel: 'Cancel',
    done: 'Deleted.',
    error: 'Could not delete. Please try again.',
    deleteAccount: 'Delete the whole account instead',
  },
  uk: {
    intro:
      'Видаляйте окремі дані, не видаляючи обліковий запис. Видалення остаточне й відбувається одразу.',
    photo: 'Фото профілю',
    photoHas: 'Збережено завантажене фото або фото з Google, воно показується в профілі.',
    photoNone: 'Фото не збережено.',
    photoAction: 'Видалити фото',
    details: 'Дані профілю',
    detailsHint:
      'Опис, кафедра, інтереси, академічний статус, університет, країна, мови, академічні посилання та «Відкритий до». Ім’я та факультет залишаться — вони потрібні для облікового запису.',
    detailsAction: 'Очистити дані',
    saved: 'Збережене',
    savedCount: (count: number) =>
      count === 0 ? 'Нічого не збережено.' : `Збережено матеріалів: ${count}.`,
    savedAction: 'Очистити збережене',
    sessions: 'Інші пристрої та історія входів',
    sessionsCount: (count: number) =>
      count === 0
        ? 'Вхід виконано лише на цьому пристрої.'
        : `Інших пристроїв із виконаним входом: ${count}. Зберігаються їхні IP-адреси та дані браузера.`,
    sessionsAction: 'Вийти й стерти',
    confirm: 'Підтвердити',
    cancel: 'Скасувати',
    done: 'Видалено.',
    error: 'Не вдалося видалити. Спробуйте ще раз.',
    deleteAccount: 'Натомість видалити весь обліковий запис',
  },
});

interface DataRowProps {
  icon: typeof ImageOff;
  title: string;
  description: string;
  actionLabel: string;
  isEmpty: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  onConfirm: () => void;
  messages: { confirm: string; cancel: string; done: string; error: string };
}

function DataRow({
  icon: Icon,
  title,
  description,
  actionLabel,
  isEmpty,
  isPending,
  isSuccess,
  isError,
  onConfirm,
  messages,
}: DataRowProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const buttonClass =
    'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
      <span className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-white sm:flex">
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-medium text-white">{title}</span>
        <span className="text-sm leading-5 text-viratec-muted">{description}</span>
        {(isSuccess || isError) && !isConfirming && (
          <span
            role={isError ? 'alert' : 'status'}
            className={cn('text-sm', isError ? 'text-state-error' : 'text-viratec-accent')}
          >
            {isError ? messages.error : messages.done}
          </span>
        )}
      </div>
      {isConfirming ? (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            autoFocus
            disabled={isPending}
            onClick={() => {
              onConfirm();
              setIsConfirming(false);
            }}
            className={cn(
              buttonClass,
              'border-state-error/60 text-state-error hover:bg-state-error/10',
            )}
          >
            {isPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {messages.confirm}
          </button>
          <button
            type="button"
            onClick={() => setIsConfirming(false)}
            className={cn(buttonClass, 'border-transparent text-viratec-muted hover:text-white')}
          >
            {messages.cancel}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isEmpty || isPending}
          onClick={() => setIsConfirming(true)}
          className={cn(
            buttonClass,
            'border-white/22 text-white hover:border-white/40 hover:bg-white/10',
          )}
        >
          {isPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          {actionLabel}
        </button>
      )}
    </li>
  );
}

const hasProfileDetails = (account: AccountDto) =>
  Boolean(
    account.bio ||
    account.department ||
    account.institution ||
    account.studyLevel ||
    account.country ||
    account.skills?.length ||
    account.languages?.length ||
    account.openTo?.length ||
    Object.values(account.links ?? {}).some(Boolean),
  );

interface DataControlsProps {
  account: AccountDto;
}

export function DataControls({ account }: DataControlsProps) {
  const t = useLocalized(DATA_CONTROLS_MESSAGES);
  const messages = { confirm: t.confirm, cancel: t.cancel, done: t.done, error: t.error };
  const deleteAvatar = useDeleteAvatar();
  const clearDetails = useClearProfileDetails();
  const savedItems = useSavedItems();
  const clearSaved = useClearSaved();
  const sessions = useSessions();
  const eraseSessions = useEraseOtherSessions();

  const savedCount = savedItems.data?.length ?? 0;
  const otherSessions = sessions.data?.filter((session) => !session.isCurrent).length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] leading-6 text-viratec-muted">{t.intro}</p>
      <ul className="flex flex-col divide-y divide-white/8 overflow-hidden rounded-[20px] border border-white/10 bg-white/3">
        <DataRow
          icon={ImageOff}
          title={t.photo}
          description={account.avatarUrl ? t.photoHas : t.photoNone}
          actionLabel={t.photoAction}
          isEmpty={!account.avatarUrl}
          isPending={deleteAvatar.isPending}
          isSuccess={deleteAvatar.isSuccess}
          isError={deleteAvatar.isError}
          onConfirm={() => deleteAvatar.mutate()}
          messages={messages}
        />
        <DataRow
          icon={UserPen}
          title={t.details}
          description={t.detailsHint}
          actionLabel={t.detailsAction}
          isEmpty={!hasProfileDetails(account)}
          isPending={clearDetails.isPending}
          isSuccess={clearDetails.isSuccess}
          isError={clearDetails.isError}
          onConfirm={() => clearDetails.mutate()}
          messages={messages}
        />
        <DataRow
          icon={Bookmark}
          title={t.saved}
          description={t.savedCount(savedCount)}
          actionLabel={t.savedAction}
          isEmpty={savedCount === 0}
          isPending={clearSaved.isPending}
          isSuccess={clearSaved.isSuccess}
          isError={clearSaved.isError}
          onConfirm={() => clearSaved.mutate()}
          messages={messages}
        />
        <DataRow
          icon={MonitorSmartphone}
          title={t.sessions}
          description={t.sessionsCount(otherSessions)}
          actionLabel={t.sessionsAction}
          isEmpty={otherSessions === 0}
          isPending={eraseSessions.isPending}
          isSuccess={eraseSessions.isSuccess}
          isError={eraseSessions.isError}
          onConfirm={() => eraseSessions.mutate()}
          messages={messages}
        />
      </ul>
      <Link
        to={buildAccountPath('danger')}
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-state-error underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
      >
        {t.deleteAccount}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}
