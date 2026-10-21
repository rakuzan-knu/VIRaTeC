import { useCallback, useState } from 'react';
import { ROUTES } from '@/shared/config/routes';
import { cn, useDocumentTitle } from '@/shared/lib';
import { ChipGroup } from '@/shared/ui/chip';
import { SelectMenu } from '@/shared/ui/select-menu';
import { RadioList } from '@/shared/ui/radio-list';
import { BottomSheet, BottomSheetSection } from '@/shared/ui/bottom-sheet';
import { ListFeedback, LoadMoreButton } from '@/shared/ui/list-feedback';
import { CtaSection } from '@/shared/ui/cta-section';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { ProjectCard, ProjectCardSkeleton } from '@/entities/project';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { AREA_OPTIONS, PAGE_SIZE, SORT_OPTIONS, STATUS_OPTIONS } from '../model/filters';
import { useProjectListing } from '../model/useProjectListing';

export function ProjectsPage() {
  useDocumentTitle('Projects');

  const listing = useProjectListing();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={['Research & Projects', 'Projects']}
          title="Projects that connect"
          accent="universities."
          description="COIL projects, workshops and research teams where students and researchers from Kyiv work together with partner universities around the world."
          descriptionClassName="lg:max-w-[720px]"
          className="lg:pb-16"
        />
      }
    >
      <section aria-label="Projects" className="mx-auto max-w-[1440px] px-5 lg:px-[85px]">
        <div className="hidden items-start justify-between gap-6 pt-10 lg:flex">
          <ChipGroup
            label="Research area"
            options={AREA_OPTIONS}
            value={listing.area}
            onChange={listing.setArea}
          />
          <div className="flex shrink-0 gap-3">
            <SelectMenu
              label="Status"
              options={STATUS_OPTIONS}
              value={listing.status}
              onChange={listing.setStatus}
              formatValue={(option) => `Status: ${option.label}`}
            />
            <SelectMenu
              label="Sort by"
              options={SORT_OPTIONS}
              value={listing.sort}
              onChange={listing.setSort}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-8 lg:hidden">
          <p className="text-[15px] text-viratec-muted">
            {listing.isLoading ? 'Loading projects…' : `${listing.totalCount} projects`}
          </p>
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="cursor-pointer rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 text-[15px] text-white"
          >
            Filters
            {listing.activeFilterCount > 0 && ` · ${listing.activeFilterCount}`}
          </button>
        </div>

        <div
          aria-busy={listing.isFetching}
          className={cn(
            'flex flex-col gap-6 pt-6 pb-[72px] lg:pt-10',
            listing.isFetching && !listing.isLoading && 'opacity-70 transition-opacity',
          )}
        >
          {listing.isError ? (
            <ListFeedback
              message="We couldn’t load projects right now."
              actionLabel="Try again"
              onAction={listing.retry}
            />
          ) : listing.isLoading ? (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <li key={index}>
                  <ProjectCardSkeleton />
                </li>
              ))}
            </ul>
          ) : listing.totalCount === 0 ? (
            <ListFeedback
              message="No projects match these filters yet."
              actionLabel="Reset filters"
              onAction={listing.reset}
            />
          ) : (
            <>
              <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {listing.projects.map((project) => (
                  <li key={project.id}>
                    <ProjectCard project={project} />
                  </li>
                ))}
              </ul>
              {listing.hasMore && <LoadMoreButton onClick={listing.loadMore} />}
            </>
          )}
        </div>
      </section>

      <CtaSection
        tone="none"
        title="Have a project idea?"
        description="Students, researchers and partner universities can propose a new COIL project."
        action={{ label: 'Propose a project', to: ROUTES.CONTACT }}
      />

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
            Show {listing.totalCount} projects
          </button>
        }
      >
        <BottomSheetSection title="Research area">
          <ChipGroup
            label="Research area"
            options={AREA_OPTIONS}
            value={listing.area}
            onChange={listing.setArea}
          />
        </BottomSheetSection>
        <BottomSheetSection title="Status">
          <ChipGroup
            label="Status"
            options={STATUS_OPTIONS}
            value={listing.status}
            onChange={listing.setStatus}
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
