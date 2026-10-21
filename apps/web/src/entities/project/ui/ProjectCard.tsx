import { Link } from 'react-router-dom';
import { buildProjectPath } from '@/shared/config/routes';
import { CardLinkLabel } from '@/shared/ui/card-link-label';
import { MediaPlaceholder } from '@/shared/ui/media-placeholder';
import { getProjectFaculties, getProjectYear } from '../lib/format';
import type { Project } from '../model/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const faculties = getProjectFaculties(project);
  const meta = [
    { label: 'Faculties', value: faculties },
    { label: 'Year', value: String(getProjectYear(project)) },
  ].filter((row) => row.value.length > 0);

  return (
    <Link
      to={buildProjectPath(project.id)}
      className="group/card flex h-full flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.035] px-5 pt-5 pb-7 transition-colors duration-200 hover:border-white/22 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
    >
      <MediaPlaceholder className="h-[160px] rounded-2xl lg:h-[190px] lg:rounded-[18px]" />
      <div className="flex flex-col gap-3 px-2">
        <h3 className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white lg:text-2xl lg:leading-[30px]">
          {project.title}
        </h3>
        <p className="line-clamp-3 text-[15px] leading-[22px] text-viratec-muted">
          {project.description}
        </p>
        <dl className="flex flex-col gap-3 text-[13px] text-viratec-subtle">
          {meta.map((row) => (
            <div key={row.label} className="flex gap-2">
              <dt className="w-[66px] shrink-0 font-medium">{row.label}</dt>
              <dd className="leading-[19px]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <CardLinkLabel
        label="View project"
        className="mt-auto pt-1 pl-2 text-[15px] font-medium text-viratec-cyan"
      />
    </Link>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-[440px] animate-pulse flex-col gap-4 rounded-[28px] border border-white/8 bg-white/4 px-5 pt-5 pb-7"
    >
      <span className="h-[160px] rounded-2xl bg-white/8 lg:h-[190px]" />
      <span className="mx-2 h-6 w-3/4 rounded bg-white/8" />
      <span className="mx-2 h-4 w-full rounded bg-white/6" />
      <span className="mx-2 h-4 w-2/3 rounded bg-white/6" />
    </div>
  );
}
