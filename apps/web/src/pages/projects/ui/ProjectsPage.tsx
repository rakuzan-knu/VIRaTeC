import { useCallback, useState } from 'react';
import { ROUTES } from '@/shared/config/routes';
import { cn, useDocumentTitle } from '@/shared/lib';
import { countUk, defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
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
import { PAGE_SIZE, useFilterOptions } from '../model/filters';
import { useProjectListing } from '../model/useProjectListing';

const PROJECTS_MESSAGES = defineMessages({
  en: {
    documentTitle: 'Projects',
    breadcrumb: ['Research & Projects', 'Projects'],
    title: 'Projects that connect',
    accent: 'universities.',
    description:
      'COIL projects, workshops and research teams where students and researchers from Kyiv work together with partner universities around the world.',
    sectionLabel: 'Projects',
    researchArea: 'Research area',
    statusValue: (label: string) => `Status: ${label}`,
    loading: 'Loading projects…',
    count: (count: number) => `${count} ${count === 1 ? 'project' : 'projects'}`,
    showCount: (count: number) => `Show ${count} ${count === 1 ? 'project' : 'projects'}`,
    loadError: 'We couldn’t load projects right now.',
    empty: 'No projects match these filters yet.',
    ctaTitle: 'Have a project idea?',
    ctaDescription:
      'Students, researchers and partner universities can propose a new COIL project.',
    ctaAction: 'Propose a project',
  },
  uk: {
    documentTitle: 'Проєкти',
    breadcrumb: ['Дослідження та проєкти', 'Проєкти'],
    title: 'Проєкти, що об’єднують',
    accent: 'університети.',
    description:
      'COIL-проєкти, воркшопи та дослідницькі команди, у яких студенти й дослідники з Києва працюють разом з університетами-партнерами з усього світу.',
    sectionLabel: 'Проєкти',
    researchArea: 'Напрям досліджень',
    statusValue: (label: string) => `Статус: ${label}`,
    loading: 'Завантаження проєктів…',
    count: (count: number) => countUk(count, { one: 'проєкт', few: 'проєкти', many: 'проєктів' }),
    showCount: (count: number) =>
      `Показати ${countUk(count, { one: 'проєкт', few: 'проєкти', many: 'проєктів' })}`,
    loadError: 'Не вдалося завантажити проєкти. Спробуйте пізніше.',
    empty: 'Поки що немає проєктів, які відповідають цим фільтрам.',
    ctaTitle: 'Маєте ідею проєкту?',
    ctaDescription:
      'Студенти, дослідники та університети-партнери можуть запропонувати новий COIL-проєкт.',
    ctaAction: 'Запропонувати проєкт',
  },
});

export function ProjectsPage() {
  const t = useLocalized(PROJECTS_MESSAGES);
  const common = useCommonMessages();
  const options = useFilterOptions();
  useDocumentTitle(t.documentTitle);

  const listing = useProjectListing();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={t.breadcrumb}
          title={t.title}
          accent={t.accent}
          description={t.description}
          descriptionClassName="lg:max-w-[720px]"
          className="lg:pb-16"
        />
      }
    >
      <section aria-label={t.sectionLabel} className="mx-auto max-w-[1440px] px-5 lg:px-[85px]">
        <div className="hidden items-start justify-between gap-6 pt-10 lg:flex">
          <ChipGroup
            label={t.researchArea}
            options={options.area}
            value={listing.area}
            onChange={listing.setArea}
          />
          <div className="flex shrink-0 gap-3">
            <SelectMenu
              label={common.status}
              options={options.status}
              value={listing.status}
              onChange={listing.setStatus}
              formatValue={(option) => t.statusValue(option.label)}
            />
            <SelectMenu
              label={common.sortBy}
              options={options.sort}
              value={listing.sort}
              onChange={listing.setSort}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-8 lg:hidden">
          <p className="text-[15px] text-viratec-muted">
            {listing.isLoading ? t.loading : t.count(listing.totalCount)}
          </p>
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="cursor-pointer rounded-[14px] border border-white/14 bg-white/6 px-4 py-3 text-[15px] text-white"
          >
            {common.filters}
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
              message={t.loadError}
              actionLabel={common.tryAgain}
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
              message={t.empty}
              actionLabel={common.resetFilters}
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
        title={t.ctaTitle}
        description={t.ctaDescription}
        action={{ label: t.ctaAction, to: ROUTES.CONTACT }}
      />

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
        <BottomSheetSection title={t.researchArea}>
          <ChipGroup
            label={t.researchArea}
            options={options.area}
            value={listing.area}
            onChange={listing.setArea}
          />
        </BottomSheetSection>
        <BottomSheetSection title={common.status}>
          <ChipGroup
            label={common.status}
            options={options.status}
            value={listing.status}
            onChange={listing.setStatus}
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
