import { useCallback, useState } from 'react';
import { ChipGroup } from '@/shared/ui/chip';
import { SelectMenu } from '@/shared/ui/select-menu';
import { SearchField } from '@/shared/ui/search-field';
import { RadioList } from '@/shared/ui/radio-list';
import { BottomSheet, BottomSheetSection } from '@/shared/ui/bottom-sheet';
import { ListFeedback, LoadMoreButton } from '@/shared/ui/list-feedback';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { FeaturedPublicationCard, PublicationCard } from '@/entities/publication';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { SORT_OPTIONS, TYPE_OPTIONS, usePublicationListing } from '../model/usePublicationListing';

export function PublicationsPage() {
  const listing = usePublicationListing();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  return (
    <PageLayout
      intro={
        <PageIntro
          eyebrow="Publications & Media"
          title="Research, news"
          accent="and media."
          description="Papers, conference talks, project news and media coverage of VIRaTeC and its partners."
          descriptionClassName="lg:max-w-[680px]"
          className="lg:pb-16"
        />
      }
    >
      <section aria-label="Publications" className="mx-auto max-w-[1440px] px-5 lg:px-[85px]">
        <div className="hidden items-start justify-between gap-6 pt-10 lg:flex">
          <ChipGroup
            label="Publication type"
            options={TYPE_OPTIONS}
            value={listing.type}
            onChange={listing.setType}
          />
          <div className="flex shrink-0 items-center gap-3">
            <SearchField
              aria-label="Search publications"
              placeholder="Search publications"
              value={listing.search}
              onChange={(event) => listing.setSearch(event.target.value)}
              containerClassName="w-[280px]"
            />
            <SelectMenu
              label="Sort by"
              options={SORT_OPTIONS}
              value={listing.sort}
              onChange={listing.setSort}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-8 lg:hidden">
          <SearchField
            aria-label="Search publications"
            placeholder="Search publications"
            value={listing.search}
            onChange={(event) => listing.setSearch(event.target.value)}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] text-viratec-muted">{listing.totalCount} results</p>
            <button
              type="button"
              onClick={() => setIsSheetOpen(true)}
              className="cursor-pointer rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 text-[15px] text-white"
            >
              Filters
              {listing.activeFilterCount > 0 && ` · ${listing.activeFilterCount}`}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-6 pb-[72px] lg:gap-8 lg:pt-10 lg:pb-[120px]">
          {listing.totalCount === 0 ? (
            <ListFeedback
              message="Nothing matches your search yet."
              actionLabel="Reset filters"
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
        title="Filters"
        onClose={closeSheet}
        headerAction={
          <button
            type="button"
            onClick={listing.reset}
            className="cursor-pointer text-[15px] font-medium text-viratec-cyan"
          >
            Reset
          </button>
        }
        footer={
          <button
            type="button"
            onClick={closeSheet}
            className={linkButtonClassName({ className: 'w-full cursor-pointer' })}
          >
            Show {listing.totalCount} results
          </button>
        }
      >
        <BottomSheetSection title="Type">
          <ChipGroup
            label="Publication type"
            options={TYPE_OPTIONS}
            value={listing.type}
            onChange={listing.setType}
          />
        </BottomSheetSection>
        <BottomSheetSection title="Sort by">
          <RadioList
            label="Sort by"
            options={SORT_OPTIONS}
            value={listing.sort}
            onChange={listing.setSort}
          />
        </BottomSheetSection>
      </BottomSheet>
    </PageLayout>
  );
}
