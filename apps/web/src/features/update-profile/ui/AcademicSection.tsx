import { useFormState, useWatch, type Control, type UseFormRegister } from 'react-hook-form';
import { PROFILE_DETAIL_LIMITS, StudyLevel } from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { useIntlNames } from '@/shared/lib/intlNames';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { useProfileFormMessages } from '../model/messages';
import { hasStudyYear, type ProfileFormValues } from '../model/schema';
import { FormSection } from './FormSection';

const STUDY_LEVELS = Object.values(StudyLevel);
const STUDY_YEARS = Array.from(
  { length: PROFILE_DETAIL_LIMITS.studyYearMax },
  (_, index) => index + 1,
);

interface SectionProps {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
}

export function AcademicSection({ control, register }: SectionProps) {
  const t = useProfileFormMessages();
  const labels = useAccountLabels();
  const { countryOptions } = useIntlNames();
  const { errors } = useFormState({ control });
  const studyLevel = useWatch({ control, name: 'studyLevel' });
  const studyLevelOptions = STUDY_LEVELS.map((value) => ({
    value,
    label: labels.studyLevel[value],
  }));
  const studyYearOptions = STUDY_YEARS.map((year) => ({
    value: String(year),
    label: labels.studyYear(year),
  }));

  return (
    <FormSection title={t.sections.academic} hint={t.sections.academicHint}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label={t.studyLevel}
          options={studyLevelOptions}
          placeholder={t.notSpecified}
          {...register('studyLevel')}
        />
        {hasStudyYear(studyLevel) && (
          <Select
            label={t.studyYear}
            options={studyYearOptions}
            placeholder={t.notSpecified}
            {...register('studyYear')}
          />
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Input
          label={t.institution}
          placeholder={t.institutionPlaceholder}
          autoComplete="organization"
          error={errors.institution?.message}
          {...register('institution')}
        />
        <Select
          label={t.country}
          options={countryOptions}
          placeholder={t.notSpecified}
          autoComplete="country"
          {...register('country')}
        />
      </div>
    </FormSection>
  );
}
