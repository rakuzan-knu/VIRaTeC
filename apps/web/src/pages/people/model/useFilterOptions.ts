import { useMemo } from 'react';
import { FacultyDivision, OpenToOption, StudyLevel } from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { useIntlNames } from '@/shared/lib/intlNames';
import { usePeopleMessages } from './messages';

const ALL = '';

export function useFilterOptions() {
  const t = usePeopleMessages();
  const labels = useAccountLabels();
  const { countryOptions, languageOptions } = useIntlNames();

  return useMemo(
    () => ({
      openTo: [
        { value: ALL, label: t.anyone },
        ...Object.values(OpenToOption).map((value) => ({ value, label: labels.openTo[value] })),
      ],
      faculty: Object.values(FacultyDivision).map((value) => ({
        value,
        label: labels.faculty[value],
      })),
      studyLevel: Object.values(StudyLevel).map((value) => ({
        value,
        label: labels.studyLevel[value],
      })),
      country: countryOptions,
      language: languageOptions,
    }),
    [t, labels, countryOptions, languageOptions],
  );
}

export type FilterOptions = ReturnType<typeof useFilterOptions>;
