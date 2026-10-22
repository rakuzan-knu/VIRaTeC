import { useId, useState } from 'react';
import { Globe2, Lock, Users } from 'lucide-react';
import { ProfileVisibility, type AccountDto } from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { useUpdatePrivacy } from '../model/useUpdatePrivacy';

const PRIVACY_MESSAGES = defineMessages({
  en: {
    visibility: 'Who can see your profile',
    descriptions: {
      [ProfileVisibility.PUBLIC]: 'Anyone with the link, including search engines and partners.',
      [ProfileVisibility.MEMBERS]: 'Only people signed in to VIRaTeC.',
      [ProfileVisibility.PRIVATE]: 'Hidden from everyone. Only you can open it.',
    } satisfies Record<ProfileVisibility, string>,
    showEmail: 'Show my email on the profile',
    showEmailHint: 'Lets collaborators contact you directly. Off by default.',
    save: 'Save privacy settings',
    saved: 'Privacy settings saved.',
    error: 'Could not save privacy settings. Please try again.',
  },
  uk: {
    visibility: 'Хто бачить ваш профіль',
    descriptions: {
      [ProfileVisibility.PUBLIC]: 'Будь-хто за посиланням, зокрема пошукові системи та партнери.',
      [ProfileVisibility.MEMBERS]: 'Лише користувачі, що увійшли до VIRaTeC.',
      [ProfileVisibility.PRIVATE]: 'Прихований від усіх. Відкрити можете лише ви.',
    },
    showEmail: 'Показувати мою пошту в профілі',
    showEmailHint: 'Дає змогу партнерам зв’язатися з вами напряму. Типово вимкнено.',
    save: 'Зберегти налаштування',
    saved: 'Налаштування приватності збережено.',
    error: 'Не вдалося зберегти налаштування. Спробуйте ще раз.',
  },
});

const OPTIONS = [
  { value: ProfileVisibility.PUBLIC, icon: Globe2 },
  { value: ProfileVisibility.MEMBERS, icon: Users },
  { value: ProfileVisibility.PRIVATE, icon: Lock },
] as const;

interface PrivacyFormProps {
  account: AccountDto;
}

export function PrivacyForm({ account }: PrivacyFormProps) {
  const t = useLocalized(PRIVACY_MESSAGES);
  const common = useCommonMessages();
  const labels = useAccountLabels();
  const [visibility, setVisibility] = useState(account.visibility);
  const [showEmail, setShowEmail] = useState(account.showEmail);
  const { mutate, isPending, isSuccess, error, reset } = useUpdatePrivacy();
  const isDirty = visibility !== account.visibility || showEmail !== account.showEmail;
  const idPrefix = useId();

  const errorMessage = !error
    ? null
    : error instanceof ApiError && error.status === NETWORK_ERROR_STATUS
      ? common.networkError
      : t.error;

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        mutate({ visibility, showEmail });
      }}
    >
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-3 text-label font-medium text-text-muted">{t.visibility}</legend>
        {OPTIONS.map(({ value, icon: Icon }) => {
          const isChecked = visibility === value;
          return (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-start gap-4 rounded-[18px] border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-viratec-lime',
                isChecked
                  ? 'border-viratec-lime/50 bg-viratec-lime/8'
                  : 'border-white/10 bg-white/3 hover:border-white/22',
              )}
            >
              <input
                type="radio"
                name="profile-visibility"
                value={value}
                aria-labelledby={`${idPrefix}-${value}-title`}
                aria-describedby={`${idPrefix}-${value}-description`}
                checked={isChecked}
                onChange={() => {
                  reset();
                  setVisibility(value);
                }}
                className="sr-only"
              />
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full',
                  isChecked ? 'bg-viratec-lime text-viratec-ink' : 'bg-white/8 text-white',
                )}
              >
                <Icon aria-hidden="true" className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span
                  id={`${idPrefix}-${value}-title`}
                  className="text-[15px] font-medium text-white"
                >
                  {labels.visibility[value]}
                </span>
                <span
                  id={`${idPrefix}-${value}-description`}
                  className="text-sm leading-5 text-viratec-muted"
                >
                  {t.descriptions[value]}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-[18px] border border-white/10 bg-white/3 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-viratec-lime">
        <span className="flex flex-col gap-0.5">
          <span id={`${idPrefix}-email-title`} className="text-[15px] font-medium text-white">
            {t.showEmail}
          </span>
          <span
            id={`${idPrefix}-email-description`}
            className="text-sm leading-5 text-viratec-muted"
          >
            {t.showEmailHint}
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          aria-labelledby={`${idPrefix}-email-title`}
          aria-describedby={`${idPrefix}-email-description`}
          checked={showEmail}
          onChange={(event) => {
            reset();
            setShowEmail(event.target.checked);
          }}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors',
            showEmail ? 'bg-viratec-lime' : 'bg-white/20',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none',
              showEmail && 'translate-x-5 bg-viratec-ink',
            )}
          />
        </span>
      </label>

      {errorMessage && (
        <p role="alert" className="text-sm text-state-error">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          label={t.save}
          loading={isPending}
          disabled={!isDirty}
          className="sm:self-start"
        />
        <p role="status" className="text-sm text-viratec-accent">
          {isSuccess && !isDirty ? t.saved : ''}
        </p>
      </div>
    </form>
  );
}
