import { Controller } from 'react-hook-form';
import type { AccountDto } from '@viratec/contracts';
import { Button } from '@/shared/ui/Button';
import { useProfileFormMessages } from '../model/messages';
import { useProfileForm } from '../model/useProfileForm';
import { AcademicSection } from './AcademicSection';
import { BasicsSection } from './BasicsSection';
import { FormSection } from './FormSection';
import { LanguagesField } from './LanguagesField';
import { LinksSection } from './LinksSection';
import { OpenToField } from './OpenToField';

interface ProfileFormProps {
  account: AccountDto;
}

export function ProfileForm({ account }: ProfileFormProps) {
  const t = useProfileFormMessages();
  const {
    control,
    register,
    errors,
    isDirty,
    submit,
    clearSuccess,
    serverError,
    isPending,
    isSuccess,
  } = useProfileForm(account);

  return (
    <form onSubmit={submit} onChange={clearSuccess} noValidate className="flex flex-col gap-7">
      <BasicsSection control={control} register={register} />
      <AcademicSection control={control} register={register} />

      <FormSection title={t.sections.languages} hint={t.sections.languagesHint}>
        <Controller
          control={control}
          name="languages"
          render={({ field }) => (
            <LanguagesField
              label={t.sections.languages}
              helperText={t.languagesHelper}
              languageLabel={t.language}
              levelLabel={t.level}
              choosePlaceholder={t.chooseLanguage}
              addLabel={t.addLanguage}
              removeLabel={t.removeLanguage}
              value={field.value}
              errors={errors.languages?.map?.((entry) => entry?.code?.message)}
              onChange={field.onChange}
            />
          )}
        />
      </FormSection>

      <LinksSection control={control} register={register} />

      <FormSection title={t.sections.openTo} hint={t.sections.openToHint}>
        <Controller
          control={control}
          name="openTo"
          render={({ field }) => (
            <OpenToField
              label={t.sections.openTo}
              helperText={t.openToHelper}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FormSection>

      {serverError && (
        <p role="alert" className="text-sm text-state-error">
          {serverError}
        </p>
      )}

      <div className="sticky bottom-4 z-10 -mx-2 flex flex-col gap-3 rounded-[20px] border border-white/10 bg-viratec-deep/90 p-3 shadow-sticky-bar sm:flex-row sm:items-center">
        <Button
          type="submit"
          label={t.save}
          loading={isPending}
          disabled={!isDirty}
          className="sm:self-start"
        />
        <p role="status" className="px-1 text-sm text-viratec-accent">
          {isSuccess && !isDirty ? t.saved : ''}
        </p>
      </div>
    </form>
  );
}
