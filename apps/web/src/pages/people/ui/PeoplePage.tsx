import { useCallback, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LoaderCircle, Lock, SlidersHorizontal, Users } from 'lucide-react';
import { FacultyDivision, OpenToOption, StudyLevel } from '@viratec/contracts';
import { PEOPLE_PAGE_SIZE } from '@/entities/person';
import { useAccountLabels, useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { countUk, defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';
import { cn, useSeo } from '@/shared/lib';
import { useIntlNames } from '@/shared/lib/intlNames';
import { BottomSheet, BottomSheetSection } from '@/shared/ui/bottom-sheet';
import { ChipGroup } from '@/shared/ui/chip';
import { ListFeedback } from '@/shared/ui/list-feedback';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { SearchField } from '@/shared/ui/search-field';
import { Select } from '@/shared/ui/Select';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';
import { useDirectory, type FilterKey } from '../model/useDirectory';
import { PersonCard, PersonCardSkeleton } from './PersonCard';

const PEOPLE_MESSAGES = defineMessages({
  en: {
    documentTitle: 'Community members',
    breadcrumb: 'Community',
    home: 'Home',
    title: 'Find your',
    accent: 'next collaborator.',
    description:
      'Students, researchers and faculty from KNU and partner universities. Filter by what people are open to — a COIL project, mentoring, co-authorship or an internship.',
    sectionLabel: 'Members',
    searchLabel: 'Search members',
    searchPlaceholder: 'Search by name, interest or university',
    openTo: 'Open to',
    anyone: 'Anyone',
    faculty: 'Faculty',
    allFaculties: 'All faculties',
    studyLevel: 'Academic status',
    allLevels: 'Any status',
    country: 'Country',
    allCountries: 'All countries',
    language: 'Language',
    allLanguages: 'Any language',
    count: (count: number) => `${count} ${count === 1 ? 'member' : 'members'}`,
    showCount: (count: number) => `Show ${count} ${count === 1 ? 'member' : 'members'}`,
    loading: 'Loading members…',
    loadError: 'We couldn’t load the member directory right now.',
    empty: 'No members match these filters yet.',
    emptyDirectoryTitle: 'No public profiles yet',
    emptyDirectoryGuest:
      'The community is just getting started. Join VIRaTeC and be one of the first members others can find.',
    emptyDirectoryMember:
      'You could be the first: fill in your interests, choose who can see your profile, and others will find you here.',
    join: 'Join the community',
    fillProfile: 'Fill in my profile',
    loadMore: 'Show more members',
    you: 'You',
    guestHint: 'Some members share their profiles only with the community.',
    signIn: 'Sign in to see everyone',
    memberHint: 'Add your interests and what you are open to so others can find you.',
    completeProfile: 'Update my profile',
  },
  uk: {
    documentTitle: 'Учасники спільноти',
    breadcrumb: 'Спільнота',
    home: 'Головна',
    title: 'Знайдіть свого',
    accent: 'наступного партнера.',
    description:
      'Студенти, дослідники та викладачі КНУ й університетів-партнерів. Фільтруйте за тим, до чого люди відкриті, — COIL-проєкт, менторство, співавторство чи стажування.',
    sectionLabel: 'Учасники',
    searchLabel: 'Пошук учасників',
    searchPlaceholder: 'Пошук за ім’ям, інтересами чи університетом',
    openTo: 'Відкриті до',
    anyone: 'Усі',
    faculty: 'Факультет',
    allFaculties: 'Усі факультети',
    studyLevel: 'Академічний статус',
    allLevels: 'Будь-який статус',
    country: 'Країна',
    allCountries: 'Усі країни',
    language: 'Мова',
    allLanguages: 'Будь-яка мова',
    count: (count: number) =>
      countUk(count, { one: 'учасник', few: 'учасники', many: 'учасників' }),
    showCount: (count: number) =>
      `Показати ${countUk(count, { one: 'учасника', few: 'учасників', many: 'учасників' })}`,
    loading: 'Завантаження учасників…',
    loadError: 'Не вдалося завантажити список учасників. Спробуйте пізніше.',
    empty: 'Поки немає учасників, які відповідають цим фільтрам.',
    emptyDirectoryTitle: 'Поки що немає відкритих профілів',
    emptyDirectoryGuest:
      'Спільнота лише формується. Приєднуйтеся до VIRaTeC і станьте одним із перших учасників, яких знайдуть інші.',
    emptyDirectoryMember:
      'Ви можете бути першими: додайте свої інтереси, оберіть, хто бачить профіль, — і вас знайдуть тут.',
    join: 'Приєднатися до спільноти',
    fillProfile: 'Заповнити профіль',
    loadMore: 'Показати ще учасників',
    you: 'Ви',
    guestHint: 'Частина учасників показує профіль лише спільноті.',
    signIn: 'Увійти, щоб бачити всіх',
    memberHint: 'Додайте інтереси та те, до чого ви відкриті, — так вас знайдуть.',
    completeProfile: 'Оновити профіль',
  },
});

type PeopleMessages = (typeof PEOPLE_MESSAGES)['en'];

const ALL = '';

function useFilterOptions(t: PeopleMessages) {
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

interface FilterSelectsProps {
  t: PeopleMessages;
  options: ReturnType<typeof useFilterOptions>;
  filters: Record<FilterKey, string>;
  onChange: (key: FilterKey, value: string) => void;
  showLabels?: boolean;
}

function FilterSelects({ t, options, filters, onChange, showLabels = false }: FilterSelectsProps) {
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

export function PeoplePage() {
  const t = useLocalized(PEOPLE_MESSAGES);
  const common = useCommonMessages();
  const location = useLocation();
  const options = useFilterOptions(t);
  const directory = useDirectory();
  const viewerId = useSessionStore((state) => state.user?.id ?? null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);
  useSeo(t.documentTitle);
  const isDirectoryEmpty =
    !directory.isLoading && !directory.isError && !directory.hasQuery && directory.total === 0;
  const showHints = !isDirectoryEmpty;

  const openToChips = (
    <ChipGroup
      label={t.openTo}
      options={options.openTo}
      value={directory.filters.openTo}
      onChange={(value) => directory.setFilter('openTo', value)}
    />
  );

  return (
    <PageLayout
      intro={
        <PageIntro
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
              t={t}
              options={options}
              filters={directory.filters}
              onChange={directory.setFilter}
            />
          </div>

          <div className="hidden flex-col gap-2.5 lg:flex">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-viratec-subtle">
              {t.openTo}
            </span>
            {openToChips}
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

          {showHints && !directory.isSignedIn && (
            <div className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-viratec-muted">
                <Lock aria-hidden="true" className="size-4 shrink-0" />
                {t.guestHint}
              </p>
              <Link
                to={ROUTES.LOGIN}
                state={{ from: `${location.pathname}${location.search}` }}
                className={linkButtonClassName({
                  size: 'md',
                  variant: 'secondary',
                  className: 'shrink-0',
                })}
              >
                {t.signIn}
              </Link>
            </div>
          )}
          {showHints && directory.isSignedIn && (
            <div className="flex flex-col gap-3 rounded-[20px] border border-viratec-lime/20 bg-viratec-lime/6 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-viratec-soft">{t.memberHint}</p>
              <Link
                to={ROUTES.ACCOUNT}
                className={linkButtonClassName({
                  size: 'md',
                  variant: 'secondary',
                  className: 'shrink-0',
                })}
              >
                {t.completeProfile}
              </Link>
            </div>
          )}
        </div>

        <div
          aria-busy={directory.isFetching}
          className={cn(
            'flex flex-col gap-6 pt-6 pb-[72px] lg:pt-8 lg:pb-[120px]',
            directory.isFetching && !directory.isLoading && 'opacity-70 transition-opacity',
          )}
        >
          {directory.isError ? (
            <ListFeedback
              message={t.loadError}
              actionLabel={common.tryAgain}
              onAction={directory.retry}
            />
          ) : directory.isLoading ? (
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PEOPLE_PAGE_SIZE / 2 }, (_, index) => (
                <li key={index}>
                  <PersonCardSkeleton />
                </li>
              ))}
            </ul>
          ) : directory.people.length === 0 && directory.hasQuery ? (
            <ListFeedback
              message={t.empty}
              actionLabel={common.resetFilters}
              onAction={directory.reset}
            />
          ) : directory.people.length === 0 ? (
            <div
              role="status"
              className="flex flex-col items-center gap-4 rounded-[28px] border border-dashed border-white/16 px-6 py-14 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-viratec-lime/12 text-viratec-accent">
                <Users aria-hidden="true" className="size-6" />
              </span>
              <h2 className="font-display text-2xl font-medium tracking-[-0.02em] text-white">
                {t.emptyDirectoryTitle}
              </h2>
              <p className="max-w-[56ch] text-[16px] leading-6 text-viratec-muted">
                {directory.isSignedIn ? t.emptyDirectoryMember : t.emptyDirectoryGuest}
              </p>
              <Link
                to={directory.isSignedIn ? ROUTES.ACCOUNT : ROUTES.REGISTER}
                className={linkButtonClassName({ size: 'md', className: 'mt-1' })}
              >
                {directory.isSignedIn ? t.fillProfile : t.join}
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {directory.people.map((person) => (
                  <li key={person.id}>
                    <PersonCard
                      person={person}
                      isViewer={person.id === viewerId}
                      viewerLabel={t.you}
                    />
                  </li>
                ))}
              </ul>
              {directory.hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={directory.loadMore}
                    disabled={directory.isLoadingMore}
                    className={linkButtonClassName({
                      variant: 'secondary',
                      className: 'w-full cursor-pointer disabled:cursor-wait sm:w-auto',
                    })}
                  >
                    {directory.isLoadingMore && (
                      <LoaderCircle aria-hidden="true" className="size-[18px] animate-spin" />
                    )}
                    {t.loadMore}
                  </button>
                </div>
              )}
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
            onClick={directory.reset}
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
            {t.showCount(directory.total)}
          </button>
        }
      >
        <BottomSheetSection title={t.openTo}>{openToChips}</BottomSheetSection>
        <div className="flex flex-col gap-4">
          <FilterSelects
            t={t}
            options={options}
            filters={directory.filters}
            onChange={directory.setFilter}
            showLabels
          />
        </div>
      </BottomSheet>
    </PageLayout>
  );
}
