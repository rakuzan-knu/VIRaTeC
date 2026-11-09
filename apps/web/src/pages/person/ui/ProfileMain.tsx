import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Building2, FolderKanban, GraduationCap } from 'lucide-react';
import type { PublicProfileDto } from '@viratec/contracts';
import { buildProjectPath } from '@/shared/config/routes';
import { usePersonMessages } from '../model/messages';
import { ProfileCard } from './ProfileCard';

const PREVIEW_COUNT = 6;
const DOI_URL_PREFIX = /^https?:\/\/(dx\.)?doi\.org\//i;
const TOGGLE_CLASS =
  'mt-3 cursor-pointer self-start text-sm font-medium text-viratec-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';

const getPaperUrl = ({ doi, fileUrl }: PublicProfileDto['papers'][number]) => {
  if (doi) return `https://doi.org/${encodeURI(doi.replace(DOI_URL_PREFIX, ''))}`;
  return fileUrl?.startsWith('https://') ? fileUrl : null;
};

export function ProfileMain({ profile }: { profile: PublicProfileDto }) {
  const t = usePersonMessages();
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllPapers, setShowAllPapers] = useState(false);
  const projects = showAllProjects ? profile.projects : profile.projects.slice(0, PREVIEW_COUNT);
  const papers = showAllPapers ? profile.papers : profile.papers.slice(0, PREVIEW_COUNT);

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
      <ProfileCard title={t.about} icon={<BookOpen className="size-5" />}>
        <p className="text-[16px] leading-7 whitespace-pre-line text-viratec-soft">
          {profile.bio || t.noBio}
        </p>
        {profile.department && (
          <p className="mt-4 flex items-center gap-2 text-sm text-viratec-muted">
            <Building2 aria-hidden="true" className="size-4 shrink-0" />
            {profile.department}
          </p>
        )}
      </ProfileCard>

      {profile.skills.length > 0 && (
        <ProfileCard title={t.interests} icon={<GraduationCap className="size-5" />}>
          <ul className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-white/14 bg-white/6 px-3.5 py-1.5 text-sm text-white"
              >
                {skill}
              </li>
            ))}
          </ul>
        </ProfileCard>
      )}

      {(profile.projects.length > 0 || profile.papers.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
          {profile.projects.length > 0 && (
            <ProfileCard title={t.projects} icon={<FolderKanban className="size-5" />}>
              <ul className="flex flex-col gap-1">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      to={buildProjectPath(project.id)}
                      className="group flex items-start justify-between gap-3 rounded-[14px] px-2 py-2.5 text-[15px] text-white transition-colors hover:bg-white/6"
                    >
                      {project.title}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-viratec-subtle transition-colors group-hover:text-viratec-accent"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              {profile.projects.length > PREVIEW_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAllProjects((value) => !value)}
                  className={TOGGLE_CLASS}
                >
                  {showAllProjects ? t.showLess : t.showAll(profile.projects.length)}
                </button>
              )}
            </ProfileCard>
          )}
          {profile.papers.length > 0 && (
            <ProfileCard title={t.papers} icon={<BookOpen className="size-5" />}>
              <ul className="flex flex-col gap-3">
                {papers.map((paper) => {
                  const url = getPaperUrl(paper);
                  return (
                    <li key={paper.id} className="text-[15px] leading-6 text-white">
                      {url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="underline-offset-4 hover:text-viratec-accent hover:underline"
                        >
                          {paper.title}
                        </a>
                      ) : (
                        paper.title
                      )}
                      <span className="block text-xs text-viratec-subtle">
                        {new Date(paper.createdAt).getFullYear()}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {profile.papers.length > PREVIEW_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAllPapers((value) => !value)}
                  className={TOGGLE_CLASS}
                >
                  {showAllPapers ? t.showLess : t.showAll(profile.papers.length)}
                </button>
              )}
            </ProfileCard>
          )}
        </div>
      )}
    </div>
  );
}
