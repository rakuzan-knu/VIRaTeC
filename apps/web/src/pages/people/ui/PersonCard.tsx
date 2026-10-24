import { Link } from 'react-router-dom';
import type { PersonSummaryDto } from '@viratec/contracts';
import { UserAvatar, useAccountLabels } from '@/entities/session';
import { buildPersonPath } from '@/shared/config/routes';
import { useIntlNames } from '@/shared/lib/intlNames';

const SKILLS_PREVIEW = 3;

interface PersonCardProps {
  person: PersonSummaryDto;
  isViewer?: boolean;
  viewerLabel?: string;
}

export function PersonCard({ person, isViewer = false, viewerLabel }: PersonCardProps) {
  const labels = useAccountLabels();
  const { countryName } = useIntlNames();
  const status = person.studyLevel
    ? [labels.studyLevel[person.studyLevel], person.studyYear && labels.studyYear(person.studyYear)]
        .filter(Boolean)
        .join(', ')
    : labels.role[person.role as keyof typeof labels.role];
  const place = [person.institution, person.country && countryName(person.country)]
    .filter(Boolean)
    .join(' · ');
  const extraSkills = person.skills.length - SKILLS_PREVIEW;

  return (
    <Link
      to={buildPersonPath(person.id)}
      className="group/card flex h-full flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-colors duration-200 hover:border-white/22 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
    >
      <div className="flex items-center gap-4">
        <UserAvatar name={person.name} avatarUrl={person.avatarUrl} className="size-14 text-lg" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-display text-xl leading-7 font-medium tracking-[-0.02em] text-white">
              {person.name}
            </h3>
            {isViewer && viewerLabel && (
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
                {viewerLabel}
              </span>
            )}
          </span>
          <p className="truncate text-sm text-viratec-accent">{status}</p>
        </div>
      </div>

      {place && <p className="line-clamp-2 text-sm leading-5 text-viratec-muted">{place}</p>}

      {person.skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {person.skills.slice(0, SKILLS_PREVIEW).map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-xs text-white"
            >
              {skill}
            </li>
          ))}
          {extraSkills > 0 && (
            <li className="rounded-full px-2 py-1 text-xs text-viratec-subtle">+{extraSkills}</li>
          )}
        </ul>
      )}

      {person.openTo.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-1.5 border-t border-white/8 pt-4">
          {person.openTo.map((option) => (
            <li
              key={option}
              className="inline-flex items-center gap-1 rounded-full bg-viratec-lime/12 px-2.5 py-1 text-xs font-medium text-viratec-accent"
            >
              {labels.openTo[option]}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}

export function PersonCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full min-h-[220px] animate-pulse flex-col gap-5 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 motion-reduce:animate-none"
    >
      <div className="flex items-center gap-4">
        <span className="size-14 rounded-full bg-white/10" />
        <span className="flex flex-1 flex-col gap-2">
          <span className="h-5 w-2/3 rounded bg-white/10" />
          <span className="h-3.5 w-1/3 rounded bg-white/8" />
        </span>
      </div>
      <span className="h-3.5 w-4/5 rounded bg-white/8" />
      <span className="mt-auto h-6 w-1/2 rounded-full bg-white/8" />
    </div>
  );
}
