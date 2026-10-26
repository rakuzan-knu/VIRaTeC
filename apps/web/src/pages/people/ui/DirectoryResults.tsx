import { Link } from 'react-router-dom';
import { LoaderCircle, Users } from 'lucide-react';
import { PEOPLE_PAGE_SIZE } from '@/entities/person';
import { useSessionStore } from '@/entities/session';
import { ROUTES } from '@/shared/config/routes';
import { useCommonMessages } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { ListFeedback } from '@/shared/ui/list-feedback';
import { linkButtonClassName } from '@/shared/ui/link-button';
import { usePeopleMessages } from '../model/messages';
import type { Directory } from '../model/useDirectory';
import { PersonCard, PersonCardSkeleton } from './PersonCard';

export function DirectoryResults({ directory }: { directory: Directory }) {
  const t = usePeopleMessages();
  const common = useCommonMessages();
  const viewerId = useSessionStore((state) => state.user?.id ?? null);

  return (
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
                <PersonCard person={person} isViewer={person.id === viewerId} viewerLabel={t.you} />
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
  );
}
