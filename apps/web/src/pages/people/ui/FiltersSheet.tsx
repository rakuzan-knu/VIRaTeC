import { useCommonMessages } from '@/shared/i18n';
import { BottomSheet, BottomSheetSection } from '@/shared/ui/bottom-sheet';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { usePeopleMessages } from '../model/messages';
import type { Directory } from '../model/useDirectory';
import type { FilterOptions } from '../model/useFilterOptions';
import { FilterSelects } from './FilterSelects';
import { OpenToChips } from './OpenToChips';

interface FiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  directory: Directory;
  options: FilterOptions;
}

export function FiltersSheet({ isOpen, onClose, directory, options }: FiltersSheetProps) {
  const t = usePeopleMessages();
  const common = useCommonMessages();

  return (
    <BottomSheet
      isOpen={isOpen}
      title={common.filters}
      onClose={onClose}
      headerAction={
        <button
          type="button"
          onClick={directory.reset}
          className="cursor-pointer text-[15px] font-medium text-viratec-cyan"
        >
          {common.reset}
        </button>
      }
      footer={
        <button
          type="button"
          onClick={onClose}
          className={linkButtonClassName({ className: 'w-full cursor-pointer' })}
        >
          {t.showCount(directory.total)}
        </button>
      }
    >
      <BottomSheetSection title={t.openTo}>
        <OpenToChips
          options={options.openTo}
          value={directory.filters.openTo}
          onChange={(value) => directory.setFilter('openTo', value)}
        />
      </BottomSheetSection>
      <div className="flex flex-col gap-4">
        <FilterSelects
          options={options}
          filters={directory.filters}
          onChange={directory.setFilter}
          showLabels
        />
      </div>
    </BottomSheet>
  );
}
