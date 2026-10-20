import { Link } from 'react-router-dom';
import { buildProjectPath } from '@/shared/config/routes';
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
      className="flex h-full flex-col gap-3.5 rounded-[22px] border border-white/12 bg-white/5 px-5 pt-5 pb-[26px] transition-colors hover:border-white/25 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
    >
      <MediaPlaceholder className="h-[150px] rounded-xl lg:h-[180px] lg:rounded-[14px]" />
      <div className="flex flex-col gap-3 px-2">
        <h3 className="text-xl leading-[26px] font-medium text-white lg:text-[22px] lg:leading-7">
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
      <span className="mt-auto pt-1 pl-2 text-[15px] font-medium text-viratec-cyan">
        View project →
      </span>
    </Link>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-[440px] animate-pulse flex-col gap-3.5 rounded-[22px] border border-white/8 bg-white/4 px-5 pt-5 pb-[26px]"
    >
      <span className="h-[150px] rounded-xl bg-white/8 lg:h-[180px]" />
      <span className="mx-2 h-6 w-3/4 rounded bg-white/8" />
      <span className="mx-2 h-4 w-full rounded bg-white/6" />
      <span className="mx-2 h-4 w-2/3 rounded bg-white/6" />
    </div>
  );
}
