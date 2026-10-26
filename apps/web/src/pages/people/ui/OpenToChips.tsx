import { ChipGroup } from '@/shared/ui/chip';
import { usePeopleMessages } from '../model/messages';
import type { FilterOptions } from '../model/useFilterOptions';

interface OpenToChipsProps {
  options: FilterOptions['openTo'];
  value: string;
  onChange: (value: string) => void;
}

export function OpenToChips({ options, value, onChange }: OpenToChipsProps) {
  const t = usePeopleMessages();
  return <ChipGroup label={t.openTo} options={options} value={value} onChange={onChange} />;
}
