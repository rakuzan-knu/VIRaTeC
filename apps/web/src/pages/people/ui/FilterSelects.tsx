import { Select } from '@/shared/ui/Select';
import { usePeopleMessages } from '../model/messages';
import type { FilterOptions } from '../model/useFilterOptions';
import type { FilterKey } from '../model/useDirectory';

interface FilterSelectsProps {
  options: FilterOptions;
  filters: Record<FilterKey, string>;
  onChange: (key: FilterKey, value: string) => void;
  showLabels?: boolean;
}

export function FilterSelects({
  options,
  filters,
  onChange,
  showLabels = false,
}: FilterSelectsProps) {
  const t = usePeopleMessages();
  const selects = [
    { key: 'faculty', label: t.faculty, placeholder: t.allFaculties },
    { key: 'studyLevel', label: t.studyLevel, placeholder: t.allLevels },
    { key: 'country', label: t.country, placeholder: t.allCountries },
    { key: 'language', label: t.language, placeholder: t.allLanguages },
  ] as const;

  return (
    <>
      {selects.map(({ key, label, placeholder }) => (
        <Select
          key={key}
          label={label}
          hideLabel={!showLabels}
          options={options[key]}
          placeholder={placeholder}
          value={filters[key]}
          onChange={(event) => onChange(key, event.target.value)}
          className="py-3"
        />
      ))}
    </>
  );
}
