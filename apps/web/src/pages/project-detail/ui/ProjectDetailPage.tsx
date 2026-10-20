import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES, buildProjectPath } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { FactsCard, type Fact } from '@/shared/ui/facts-card';
import { MediaPlaceholder } from '@/shared/ui/media-placeholder';
import { CtaSection } from '@/shared/ui/cta-section';
import { ListFeedback } from '@/shared/ui/list-feedback';
import { ButtonArrow, LinkButton, linkButtonClassName } from '@/shared/ui/link-button';
import {
  PROJECT_STATUS_LABEL,
  getProjectFaculties,
  getProjectYear,
  useProject,
  useProjects,
  type Project,
} from '@/entities/project';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';

const BREADCRUMB_ROOT = ['Research & Projects', 'Projects'];

const buildFacts = (project: Project): Fact[] =>
  [
    { label: 'Area', value: project.tags.join(', ') },
    { label: 'Status', value: PROJECT_STATUS_LABEL[project.status] },
    { label: 'Year', value: String(getProjectYear(project)) },
    { label: 'Faculties', value: getProjectFaculties(project) },
  ].filter((fact) => fact.value.length > 0);

function ProjectBody({ project }: { project: Project }) {
  const paragraphs = project.description.split(/\n{2,}/).filter(Boolean);

  return (
    <PageSection containerClassName="lg:flex-row lg:items-start lg:gap-16">
      <div className="flex flex-1 flex-col gap-5">
        <MediaPlaceholder className="h-[220px] rounded-[18px] bg-linear-to-r from-[#0d338c] to-[#1a8c99] lg:h-[420px] lg:rounded-[22px]" />
        <h2 className="text-2xl leading-[30px] text-white lg:text-[28px] lg:leading-[34px]">
          About the project
        </h2>
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-base leading-[26px] text-viratec-muted lg:text-[17px] lg:leading-7"
          >
            {paragraph}
          </p>
        ))}
      </div>
      <FactsCard
        title="Project facts"
        facts={buildFacts(project)}
        actions={
          <div className="flex flex-col gap-3">
            <LinkButton to={ROUTES.OPPORTUNITIES} className="w-full">
              Join a project
            </LinkButton>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className={linkButtonClassName({ variant: 'secondary', className: 'w-full' })}
              >
                Open demo
                <ButtonArrow />
              </a>
            )}
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className={linkButtonClassName({ variant: 'secondary', className: 'w-full' })}
              >
                Repository
                <ButtonArrow />
              </a>
            )}
          </div>
        }
      />
    </PageSection>
  );
}

function RelatedProjects({ currentId }: { currentId: string }) {
  const { data } = useProjects();
  const related = (data ?? []).filter((project) => project.id !== currentId).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <PageSection tone="surface" aria-labelledby="related-title">
      <SectionHeader id="related-title" eyebrow="Related projects" title="More projects" />
      <ul className="grid gap-6 lg:grid-cols-3">
        {related.map((project) => (
          <li key={project.id}>
            <InfoCard
              withImage
              title={project.title}
              description={project.description}
              linkLabel="View project →"
              to={buildProjectPath(project.id)}
              className="lg:min-h-[409px] [&>p]:line-clamp-3"
            />
          </li>
        ))}
      </ul>
    </PageSection>
  );
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isPending, isError, refetch } = useProject(projectId);

  const intro = project ? (
    <PageIntro
      breadcrumb={[...BREADCRUMB_ROOT, project.title]}
      title={project.title}
      description={`${PROJECT_STATUS_LABEL[project.status]} · ${getProjectYear(project)}`}
      descriptionClassName="lg:max-w-[720px]"
      className="lg:pb-16"
    />
  ) : (
    <PageIntro
      breadcrumb={BREADCRUMB_ROOT}
      title={isPending ? 'Loading project…' : 'Project not found'}
      description={
        isPending
          ? 'Fetching project details.'
          : 'The project may have been moved or is no longer available.'
      }
      className="lg:pb-16"
    />
  );

  return (
    <PageLayout intro={intro}>
      {project && (
        <>
          <ProjectBody project={project} />
          <RelatedProjects currentId={project.id} />
        </>
      )}
      {!project && !isPending && (
        <PageSection>
          <ListFeedback
            message={isError ? 'We couldn’t load this project.' : 'This project does not exist.'}
            actionLabel={isError ? 'Try again' : 'Back to projects'}
            onAction={() => (isError ? void refetch() : navigate(ROUTES.PROJECTS))}
          />
        </PageSection>
      )}
      <CtaSection
        title="Have a project idea?"
        description="Students and researchers can propose their own project and find an international team."
        action={{ label: 'Propose a project', to: ROUTES.CONTACT }}
      />
    </PageLayout>
  );
}
