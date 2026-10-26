import {
  Controller,
  useFormState,
  useWatch,
  type Control,
  type UseFormRegister,
} from 'react-hook-form';
import { FacultyDivision } from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { ChipGroup } from '@/shared/ui/chip';
import { useProfileFormMessages } from '../model/messages';
import type { ProfileFormValues } from '../model/schema';
import { FormSection } from './FormSection';
import { SkillsField } from './SkillsField';

const FACULTY_ORDER = [FacultyDivision.FIT, FacultyDivision.NNIF, FacultyDivision.OTHER] as const;

interface SectionProps {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
}

export function BasicsSection({ control, register }: SectionProps) {
  const t = useProfileFormMessages();
  const labels = useAccountLabels();
  const { errors } = useFormState({ control });
  const bioLength = useWatch({ control, name: 'bio' }).length;
  const facultyOptions = FACULTY_ORDER.map((value) => ({ value, label: labels.faculty[value] }));

  return (
    <FormSection title={t.sections.basics} hint={t.sections.basicsHint}>
      <Input
        label={t.name}
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <div className="flex flex-col gap-2">
        <span aria-hidden="true" className="text-label font-medium text-text-muted">
          {t.faculty}
        </span>
        <Controller
          control={control}
          name="faculty"
          render={({ field }) => (
            <ChipGroup
              label={t.faculty}
              options={facultyOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      <Input
        label={t.department}
        placeholder={t.departmentPlaceholder}
        autoComplete="organization-title"
        error={errors.department?.message}
        {...register('department')}
      />
      <Textarea
        label={t.bio}
        placeholder={t.bioPlaceholder}
        rows={4}
        helperText={t.characters(bioLength)}
        error={errors.bio?.message}
        {...register('bio')}
      />
      <Controller
        control={control}
        name="skills"
        render={({ field }) => (
          <SkillsField
            label={t.skills}
            placeholder={t.skillsPlaceholder}
            helperText={t.skillsHelper}
            addLabel={t.addSkill}
            removeLabel={t.removeSkill}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </FormSection>
  );
}
