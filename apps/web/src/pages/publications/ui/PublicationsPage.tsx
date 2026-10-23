import { useCallback, useState } from 'react';
import { ChipGroup } from '@/shared/ui/chip';
import { SelectMenu } from '@/shared/ui/select-menu';
import { SearchField } from '@/shared/ui/search-field';
import { RadioList } from '@/shared/ui/radio-list';
import { BottomSheet, BottomSheetSection } from '@/shared/ui/bottom-sheet';
import { ListFeedback, LoadMoreButton } from '@/shared/ui/list-feedback';
import { linkButtonClassName } from '@/shared/ui/link-button';
import {
  FeaturedPublicationCard,
  PublicationCard,
  PublicationCardSkeleton,
} from '@/entities/publication';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import {
  PAGE_SIZE,
  useListingOptions,
  usePublicationListing,
} from '../model/usePublicationListing';
import { useSeo } from '@/shared/lib';
import { countUk, defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';

const PUBLICATIONS_MESSAGES = defineMessages({
  en: {
    documentTitle: 'Publications',
    eyebrow: 'Publications & Media',
    title: 'Research, news',
    accent: 'and media.',
    description:
      'Papers, conference talks, project news and media coverage of VIRaTeC and its partners.',
    sectionLabel: 'Publications',
    typeLabel: 'Publication type',
    search: 'Search publications',
    count: (count: number) => `${count} ${count === 1 ? 'result' : 'results'}`,
    showCount: (count: number) => `Show ${count} ${count === 1 ? 'result' : 'results'}`,
    empty: 'Nothing matches your search yet.',
    loadError: 'Could not load publications.',
  },
  uk: {
    documentTitle: 'Публікації',
    eyebrow: 'Публікації та медіа',
    title: 'Дослідження, новини',
    accent: 'та медіа.',
    description:
      'Статті, доповіді на конференціях, новини проєктів і згадки про VIRaTeC та партнерів у медіа.',
    sectionLabel: 'Публікації',
    typeLabel: 'Тип публікації',
    search: 'Пошук публікацій',
    count: (count: number) =>
      countUk(count, { one: 'результат', few: 'результати', many: 'результатів' }),
    showCount: (count: number) =>
      `Показати ${countUk(count, { one: 'результат', few: 'результати', many: 'результатів' })}`,
    empty: 'За вашим запитом поки нічого не знайдено.',
    loadError: 'Не вдалося завантажити публікації.',
  },
});

export function PublicationsPage() {
  const t = useLocalized(PUBLICATIONS_MESSAGES);
  const common = useCommonMessages();
  const options = useListingOptions();
  useSeo(t.documentTitle);

  const listing = usePublicationListing();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  return (
    <PageLayout
      intro={
        <PageIntro
          eyebrow={t.eyebrow}
          title={t.title}
          accent={t.accent}
          description={t.description}
          descriptionClassName="lg:max-w-[680px]"
          className="lg:pb-16"
        />
      }
    >
      <section aria-label={t.sectionLabel} className="mx-auto max-w-[1440px] px-5 lg:px-[85px]">
        <div className="hidden items-start justify-between gap-6 pt-10 lg:flex">
          <ChipGroup
            label={t.typeLabel}
            options={options.type}
            value={listing.type}
            onChange={listing.setType}
          />
          <div className="flex shrink-0 items-center gap-3">
            <SearchField
              aria-label={t.search}
              placeholder={t.search}
              value={listing.search}
              onChange={(event) => listing.setSearch(event.target.value)}
              containerClassName="w-[280px]"
            />
            <SelectMenu
              label={common.sortBy}
              options={options.sort}
              value={listing.sort}
              onChange={listing.setSort}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8 lg:hidden">
          <SearchField
            aria-label={t.search}
            placeholder={t.search}
            value={listing.search}
            onChange={(event) => listing.setSearch(event.target.value)}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] text-viratec-muted">{t.count(listing.totalCount)}</p>
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="cursor-pointer rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 text-[15px] text-white"
            >
              {common.filters}
              {listing.activeFilterCount > 0 && ` · ${listing.activeFilterCount}`}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-6 pb-[72px] lg:gap-8 lg:pt-10 lg:pb-[120px]">
          {listing.isError ? (
            <ListFeedback
              message={t.loadError}
              actionLabel={common.tryAgain}
              onAction={listing.retry}
            />
          ) : listing.isLoading ? (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <li key={index}>
                  <PublicationCardSkeleton />
                </li>
              ))}
            </ul>
          ) : listing.totalCount === 0 ? (
            <ListFeedback
              message={t.empty}
              actionLabel={common.resetFilters}
              onAction={listing.reset}
            />
          ) : (
            <>
              {listing.featured && <FeaturedPublicationCard publication={listing.featured} />}
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {listing.items.map((publication) => (
                  <li key={publication.slug}>
                    <PublicationCard publication={publication} />
                  </li>
                ))}
              </ul>
              {listing.hasMore && <LoadMoreButton onClick={listing.loadMore} />}
            </>
          )}
        </div>
      </section>

      <BottomSheet
        isOpen={isSheetOpen}
        title={common.filters}
        onClose={closeSheet}
        headerAction={
          <button
            type="button"
            onClick={listing.reset}
            className="cursor-pointer text-[15px] font-medium text-viratec-cyan"
          >
            {common.reset}
          </button>
        }
        footer={
          <button
            type="button"
            onClick={closeSheet}
            className={linkButtonClassName({ className: 'w-full cursor-pointer' })}
          >
            {t.showCount(listing.totalCount)}
          </button>
        }
      >
        <BottomSheetSection title={common.type}>
          <ChipGroup
            label={t.typeLabel}
            options={options.type}
            value={listing.type}
            onChange={listing.setType}
          />
        </BottomSheetSection>
        <BottomSheetSection title={common.sortBy}>
          <RadioList
            label={common.sortBy}
            options={options.sort}
            value={listing.sort}
            onChange={listing.setSort}
          />
        </BottomSheetSection>
      </BottomSheet>
    </PageLayout>
  );
}
