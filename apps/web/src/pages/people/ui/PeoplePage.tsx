import { useCallback, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import { useSeo } from '@/shared/lib';
import { SearchField } from '@/shared/ui/search-field';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { usePeopleMessages } from '../model/messages';
import { useDirectory } from '../model/useDirectory';
import { useFilterOptions } from '../model/useFilterOptions';
import { DirectoryHints } from './DirectoryHints';
import { DirectoryResults } from './DirectoryResults';
import { FilterSelects } from './FilterSelects';
import { FiltersSheet } from './FiltersSheet';
import { OpenToChips } from './OpenToChips';

export function PeoplePage() {
  const t = usePeopleMessages();
  const common = useCommonMessages();
  const options = useFilterOptions();
  const directory = useDirectory();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);
  useSeo(t.documentTitle);
  const isDirectoryEmpty =
    !directory.isLoading && !directory.isError && !directory.hasQuery && directory.total === 0;

  return (
    <PageLayout
      footer={<SiteFooter />}
      intro={
        <PageIntro
          header={<SiteHeader />}
          breadcrumb={[{ label: t.home, to: ROUTES.HOME }, t.breadcrumb]}
          title={t.title}
          accent={t.accent}
          description={t.description}
          descriptionClassName="lg:max-w-[760px]"
          className="lg:pb-16"
        />
      }
    >
      <section aria-label={t.sectionLabel} className="mx-auto max-w-[1440px] px-5 lg:px-[85px]">
        <div className="flex flex-col gap-4 pt-8 lg:pt-10">
          <div className="flex gap-3">
            <SearchField
              aria-label={t.searchLabel}
              placeholder={t.searchPlaceholder}
              value={directory.searchInput}
              onChange={(event) => directory.setSearchInput(event.target.value)}
              containerClassName="min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 text-[15px] text-white lg:hidden"
            >
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              <span className="sr-only sm:not-sr-only">{common.filters}</span>
              {directory.activeFilterCount > 0 && ` · ${directory.activeFilterCount}`}
            </button>
          </div>

          <div className="hidden grid-cols-4 gap-3 lg:grid">
            <FilterSelects
              options={options}
              filters={directory.filters}
              onChange={directory.setFilter}
            />
          </div>

          <div className="hidden flex-col gap-2.5 lg:flex">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-viratec-subtle">
              {t.openTo}
            </span>
            <OpenToChips
              options={options.openTo}
              value={directory.filters.openTo}
              onChange={(value) => directory.setFilter('openTo', value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
            <p role="status" className="text-[15px] text-viratec-muted">
              {directory.isLoading ? t.loading : directory.isError ? '' : t.count(directory.total)}
            </p>
            {directory.hasQuery && (
              <button
                type="button"
                onClick={directory.reset}
                className="cursor-pointer text-[15px] font-medium text-viratec-cyan hover:underline"
              >
                {common.resetFilters}
              </button>
            )}
          </div>

          {!isDirectoryEmpty && <DirectoryHints isSignedIn={directory.isSignedIn} />}
        </div>

        <DirectoryResults directory={directory} />
      </section>

      <FiltersSheet
        isOpen={isSheetOpen}
        onClose={closeSheet}
        directory={directory}
        options={options}
      />
    </PageLayout>
  );
}
