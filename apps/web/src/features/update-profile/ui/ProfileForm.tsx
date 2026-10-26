import { useMemo, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FacultyDivision,
  PROFILE_DETAIL_LIMITS,
  PROFILE_LIMITS,
  PROFILE_LINK_KEYS,
  StudyLevel,
  type AccountDto,
  type ProfileLinkKey,
} from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { HOTKEYS } from '@/shared/lib';
import { useIntlNames } from '@/shared/lib/intlNames';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { ChipGroup } from '@/shared/ui/chip';
import {
  createProfileFormSchema,
  hasStudyYear,
  toProfileFormValues,
  toUpdateProfileRequest,
  type ProfileFormValues,
} from '../model/schema';
import { useUpdateProfile } from '../model/useUpdateProfile';
import { LanguagesField } from './LanguagesField';
import { OpenToField } from './OpenToField';
import { SkillsField } from './SkillsField';

const LINK_PLACEHOLDERS: Record<ProfileLinkKey, string> = {
  orcid: '0000-0002-1825-0097',
  googleScholar: 'https://scholar.google.com/citations?user=…',
  scopus: '57190000000',
  researchGate: 'https://www.researchgate.net/profile/…',
  linkedin: 'https://www.linkedin.com/in/…',
  github: 'octocat',
  website: 'https://example.com',
};

const PROFILE_FORM_MESSAGES = defineMessages({
  en: {
    sections: {
      basics: 'About you',
      basicsHint: 'The essentials people see first.',
      academic: 'Studies and affiliation',
      academicHint: 'Where you study or work — helps partners understand your background.',
      languages: 'Languages',
      languagesHint: 'COIL teams are matched across countries, so languages matter.',
      links: 'Academic profiles',
      linksHint: 'Paste a link or an ID — we keep only the identifier.',
      openTo: 'Open to',
      openToHint: 'Shown as badges on your public profile.',
    },
    name: 'Full name',
    faculty: 'Faculty or institution',
    department: 'Department or research group',
    departmentPlaceholder: 'e.g. Department of Intelligent Software Systems',
    bio: 'Bio',
    bioPlaceholder:
      'Your research focus, current projects or what you would like to collaborate on.',
    skills: 'Research interests and skills',
    skillsPlaceholder: 'e.g. Machine learning',
    skillsHelper: `Press Enter to add. Up to ${PROFILE_LIMITS.skillsMax} items — they help others find collaborators.`,
    addSkill: 'Add',
    removeSkill: (skill: string) => `Remove ${skill}`,
    characters: (count: number) => `${count}/${PROFILE_LIMITS.bioMax}`,
    studyLevel: 'Academic status',
    studyYear: 'Year of study',
    institution: 'University or organisation',
    institutionPlaceholder: 'Taras Shevchenko National University of Kyiv',
    country: 'Country',
    notSpecified: 'Not specified',
    language: 'Language',
    level: 'Level',
    chooseLanguage: 'Choose a language',
    addLanguage: 'Add language',
    removeLanguage: (language: string) => `Remove ${language}`,
    languagesHelper: `Up to ${PROFILE_DETAIL_LIMITS.languagesMax} languages.`,
    openToHelper: 'Select everything that applies right now.',
    save: 'Save changes',
    saved: 'Profile saved.',
    unexpectedError: 'Could not save the profile. Please try again.',
    validation: {
      nameMin: `Name must be at least ${PROFILE_LIMITS.nameMin} characters`,
      nameMax: `Name must be at most ${PROFILE_LIMITS.nameMax} characters`,
      departmentMax: `Department must be at most ${PROFILE_LIMITS.departmentMax} characters`,
      bioMax: `Keep it under ${PROFILE_LIMITS.bioMax} characters`,
      institutionMax: `Keep it under ${PROFILE_DETAIL_LIMITS.institutionMax} characters`,
      languageRequired: 'Choose a language or remove the row',
      invalidLink: {
        orcid: 'Enter an ORCID iD like 0000-0002-1825-0097',
        googleScholar: 'Paste your Google Scholar profile link',
        scopus: 'Enter a Scopus Author ID (digits) or profile link',
        researchGate: 'Paste a researchgate.net profile link',
        linkedin: 'Paste a linkedin.com profile link',
        github: 'Enter a GitHub username or profile link',
        website: 'Enter a valid website address',
      } satisfies Record<ProfileLinkKey, string>,
    },
  },
  uk: {
    sections: {
      basics: 'Про вас',
      basicsHint: 'Головне, що бачать першим.',
      academic: 'Навчання та афіліація',
      academicHint: 'Де ви навчаєтеся чи працюєте — це допомагає партнерам зрозуміти ваш контекст.',
      languages: 'Мови',
      languagesHint: 'Команди COIL формуються з різних країн, тож мови важливі.',
      links: 'Академічні профілі',
      linksHint: 'Вставте посилання або ID — ми збережемо лише ідентифікатор.',
      openTo: 'Відкритий до',
      openToHint: 'Показується значками у вашому публічному профілі.',
    },
    name: 'Повне ім’я',
    faculty: 'Факультет або заклад',
    department: 'Кафедра або дослідницька група',
    departmentPlaceholder: 'напр. Кафедра інтелектуальних програмних систем',
    bio: 'Коротко про себе',
    bioPlaceholder: 'Ваш дослідницький фокус, поточні проєкти або в чому хочете співпрацювати.',
    skills: 'Дослідницькі інтереси та навички',
    skillsPlaceholder: 'напр. Машинне навчання',
    skillsHelper: `Натисніть Enter, щоб додати. До ${PROFILE_LIMITS.skillsMax} пунктів — так вас легше знайдуть для співпраці.`,
    addSkill: 'Додати',
    removeSkill: (skill: string) => `Видалити ${skill}`,
    characters: (count: number) => `${count}/${PROFILE_LIMITS.bioMax}`,
    studyLevel: 'Академічний статус',
    studyYear: 'Рік навчання',
    institution: 'Університет або організація',
    institutionPlaceholder: 'Київський національний університет імені Тараса Шевченка',
    country: 'Країна',
    notSpecified: 'Не вказано',
    language: 'Мова',
    level: 'Рівень',
    chooseLanguage: 'Оберіть мову',
    addLanguage: 'Додати мову',
    removeLanguage: (language: string) => `Видалити ${language}`,
    languagesHelper: `До ${PROFILE_DETAIL_LIMITS.languagesMax} мов.`,
    openToHelper: 'Позначте все, що актуально зараз.',
    save: 'Зберегти зміни',
    saved: 'Профіль збережено.',
    unexpectedError: 'Не вдалося зберегти профіль. Спробуйте ще раз.',
    validation: {
      nameMin: `Ім’я має містити щонайменше ${PROFILE_LIMITS.nameMin} символи`,
      nameMax: `Ім’я має містити не більше ${PROFILE_LIMITS.nameMax} символів`,
      departmentMax: `Назва має містити не більше ${PROFILE_LIMITS.departmentMax} символів`,
      bioMax: `Не більше ${PROFILE_LIMITS.bioMax} символів`,
      institutionMax: `Не більше ${PROFILE_DETAIL_LIMITS.institutionMax} символів`,
      languageRequired: 'Оберіть мову або видаліть рядок',
      invalidLink: {
        orcid: 'Введіть ORCID iD у форматі 0000-0002-1825-0097',
        googleScholar: 'Вставте посилання на профіль Google Scholar',
        scopus: 'Введіть Scopus Author ID (цифри) або посилання на профіль',
        researchGate: 'Вставте посилання на профіль researchgate.net',
        linkedin: 'Вставте посилання на профіль linkedin.com',
        github: 'Введіть ім’я користувача GitHub або посилання на профіль',
        website: 'Введіть коректну адресу сайту',
      },
    },
  },
});

const FACULTY_ORDER = [FacultyDivision.FIT, FacultyDivision.NNIF, FacultyDivision.OTHER] as const;
const STUDY_LEVELS = Object.values(StudyLevel);
const STUDY_YEARS = Array.from(
  { length: PROFILE_DETAIL_LIMITS.studyYearMax },
  (_, index) => index + 1,
);

interface FormSectionProps {
  title: string;
  hint: string;
  children: ReactNode;
}

function FormSection({ title, hint, children }: FormSectionProps) {
  return (
    <section className="flex flex-col gap-5 border-t border-white/8 pt-7 first:border-t-0 first:pt-0">
      <header className="flex flex-col gap-1">
        <h4 className="font-display text-lg leading-6 font-medium tracking-[-0.01em] text-white">
          {title}
        </h4>
        <p className="text-sm leading-5 text-viratec-muted">{hint}</p>
      </header>
      {children}
    </section>
  );
}

interface ProfileFormProps {
  account: AccountDto;
}

export function ProfileForm({ account }: ProfileFormProps) {
  const t = useLocalized(PROFILE_FORM_MESSAGES);
  const common = useCommonMessages();
  const labels = useAccountLabels();
  const { countryOptions } = useIntlNames();
  const schema = useMemo(() => createProfileFormSchema(t.validation), [t]);
  const { mutate: save, isPending, isSuccess, error, reset: resetMutation } = useUpdateProfile();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toProfileFormValues(account),
  });

  const facultyOptions = useMemo(
    () => FACULTY_ORDER.map((value) => ({ value, label: labels.faculty[value] })),
    [labels],
  );
  const studyLevelOptions = STUDY_LEVELS.map((value) => ({
    value,
    label: labels.studyLevel[value],
  }));
  const studyYearOptions = STUDY_YEARS.map((year) => ({
    value: String(year),
    label: labels.studyYear(year),
  }));

  const bioLength = watch('bio').length;
  const studyLevel = watch('studyLevel');

  const serverError =
    error instanceof ApiError && error.status === NETWORK_ERROR_STATUS
      ? common.networkError
      : error
        ? t.unexpectedError
        : null;

  const onSubmit = (values: ProfileFormValues) =>
    save(toUpdateProfileRequest(values), {
      onSuccess: (updated) => reset(toProfileFormValues(updated)),
    });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => isSuccess && resetMutation()}
      noValidate
      className="flex flex-col gap-7"
    >
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

      <FormSection title={t.sections.links} hint={t.sections.linksHint}>
        <div className="grid gap-5 sm:grid-cols-2">
          {PROFILE_LINK_KEYS.map((key) => (
            <Input
              key={key}
              label={labels.links[key]}
              placeholder={LINK_PLACEHOLDERS[key]}
              inputMode={key === 'orcid' || key === 'scopus' ? 'text' : 'url'}
              autoComplete={key === 'website' ? 'url' : 'off'}
              spellCheck={false}
              error={errors.links?.[key]?.message}
              {...register(`links.${key}`)}
            />
          ))}
        </div>
      </FormSection>

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

      <div className="sticky bottom-4 z-10 -mx-2 flex flex-col gap-3 rounded-[20px] border border-white/10 bg-viratec-deep/90 p-3 shadow-[0_20px_50px_-20px_rgba(0,5,26,0.9)] sm:flex-row sm:items-center">
        <Button
          type="submit"
          label={t.save}
          loading={isPending}
          disabled={!isDirty}
          aria-keyshortcuts={HOTKEYS.submit.aria}
          className="sm:self-start"
        />
        <kbd
          aria-hidden="true"
          className="hidden rounded-md border border-white/14 px-1.5 font-sans text-xs leading-5 text-viratec-subtle pointer-fine:sm:inline-block"
        >
          {HOTKEYS.submit.label}
        </kbd>
        <p role="status" className="px-1 text-sm text-viratec-accent">
          {isSuccess && !isDirty ? t.saved : ''}
        </p>
      </div>
    </form>
  );
}
