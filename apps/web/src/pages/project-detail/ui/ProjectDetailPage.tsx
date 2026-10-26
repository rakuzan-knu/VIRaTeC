import { useNavigate, useParams } from 'react-router-dom';
import { SavedItemKind } from '@viratec/contracts';
import { SaveButton } from '@/features/save-item';
import { ROUTES, buildProjectPath, buildPersonPath } from '@/shared/config/routes';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { InfoCard } from '@/shared/ui/info-card';
import { FactsCard, type Fact } from '@/shared/ui/facts-card';
import { MediaPlaceholder } from '@/shared/ui/media-placeholder';
import { CtaSection } from '@/shared/ui/cta-section';
import { ListFeedback } from '@/shared/ui/list-feedback';
import { ButtonArrow, LinkButton, linkButtonClassName } from '@/shared/ui/link-button';
import {
  getProjectCover,
  getProjectFaculties,
  getProjectYear,
  useProject,
  useProjectLabels,
  useProjects,
  type Project,
} from '@/entities/project';
import { PageIntro, type BreadcrumbItem } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import { useSeo } from '@/shared/lib';
import { defineMessages, useCommonMessages, useLocalized } from '@/shared/i18n';

const PROJECT_DETAIL_MESSAGES = defineMessages({
  en: {
    researchAndProjects: 'Research & Projects',
    projects: 'Projects',
    project: 'Project',
    area: 'Area',
    lead: 'Project lead',
    aboutProject: 'About the project',
    projectFacts: 'Project facts',
    joinProject: 'Join a project',
    openDemo: 'Open demo',
    repository: 'Repository',
    relatedEyebrow: 'Related projects',
    relatedTitle: 'More projects',
    loadingTitle: 'Loading project…',
    loadingDescription: 'Fetching project details.',
    notFoundTitle: 'Project not found',
    notFoundDescription: 'The project may have been moved or is no longer available.',
    loadError: 'We couldn’t load this project.',
    missing: 'This project does not exist.',
    backToProjects: 'Back to projects',
    ctaTitle: 'Have a project idea?',
    ctaDescription:
      'Students and researchers can propose their own project and find an international team.',
    ctaAction: 'Propose a project',
  },
  uk: {
    researchAndProjects: 'Дослідження та проєкти',
    projects: 'Проєкти',
    project: 'Проєкт',
    area: 'Напрям',
    lead: 'Керівник проєкту',
    aboutProject: 'Про проєкт',
    projectFacts: 'Інформація про проєкт',
    joinProject: 'Долучитися до проєкту',
    openDemo: 'Відкрити демо',
    repository: 'Репозиторій',
    relatedEyebrow: 'Схожі проєкти',
    relatedTitle: 'Більше проєктів',
    loadingTitle: 'Завантаження проєкту…',
    loadingDescription: 'Отримуємо інформацію про проєкт.',
    notFoundTitle: 'Проєкт не знайдено',
    notFoundDescription: 'Можливо, проєкт перемістили або він більше не доступний.',
    loadError: 'Не вдалося завантажити цей проєкт.',
    missing: 'Такого проєкту не існує.',
    backToProjects: 'До проєктів',
    ctaTitle: 'Маєте ідею проєкту?',
    ctaDescription:
      'Студенти та дослідники можуть запропонувати власний проєкт і знайти міжнародну команду.',
    ctaAction: 'Запропонувати проєкт',
  },
});

function ProjectBody({ project }: { project: Project }) {
  const t = useLocalized(PROJECT_DETAIL_MESSAGES);
  const common = useCommonMessages();
  const labels = useProjectLabels();
  const facts: Fact[] = [
    { label: t.area, value: project.tags.join(', ') },
    { label: common.status, value: labels.status[project.status] },
    { label: common.year, value: String(getProjectYear(project)) },
    { label: labels.faculties, value: getProjectFaculties(project, labels.faculty) },
    {
      label: t.lead,
      value: project.lead?.name ?? '',
      to: project.lead ? buildPersonPath(project.lead.id) : undefined,
    },
  ].filter((fact) => fact.value.length > 0);
  const paragraphs = project.description.split(/\n{2,}/).filter(Boolean);

  return (
    <PageSection containerClassName="lg:flex-row lg:items-start lg:gap-16">
      <div className="flex flex-1 flex-col gap-5">
        <MediaPlaceholder
          src={getProjectCover(project)}
          sizes="(min-width: 1440px) 1270px, 100vw"
          className="h-[220px] rounded-[24px] lg:h-[420px] lg:rounded-[32px]"
        />
        <h2 className="font-display text-2xl leading-[30px] font-medium tracking-[-0.02em] text-white lg:text-[32px] lg:leading-[38px]">
          {t.aboutProject}
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
        title={t.projectFacts}
        facts={facts}
        actions={
          <div className="flex flex-col gap-3">
            <LinkButton to={ROUTES.OPPORTUNITIES} className="w-full">
              {t.joinProject}
            </LinkButton>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className={linkButtonClassName({ variant: 'secondary', className: 'w-full' })}
              >
                {t.openDemo}
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
                {t.repository}
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
  const t = useLocalized(PROJECT_DETAIL_MESSAGES);
  const common = useCommonMessages();
  const related = (data ?? []).filter((project) => project.id !== currentId).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <PageSection tone="surface" aria-labelledby="related-title">
      <SectionHeader id="related-title" eyebrow={t.relatedEyebrow} title={t.relatedTitle} />
      <ul className="grid gap-6 lg:grid-cols-3">
        {related.map((project) => (
          <li key={project.id}>
            <InfoCard
              image={getProjectCover(project)}
              title={project.title}
              description={project.description}
              linkLabel={common.viewProject}
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
  const t = useLocalized(PROJECT_DETAIL_MESSAGES);
  const common = useCommonMessages();
  const labels = useProjectLabels();
  useSeo(project?.title ?? (isPending ? t.project : t.notFoundTitle), {
    description: project?.description,
    image: project && getProjectCover(project),
    type: 'article',
    noindex: isError,
  });

  const breadcrumbRoot: BreadcrumbItem[] = [
    t.researchAndProjects,
    { label: t.projects, to: ROUTES.PROJECTS },
  ];

  const intro = project ? (
    <PageIntro
      header={<SiteHeader />}
      breadcrumb={[...breadcrumbRoot, project.title]}
      title={project.title}
      description={`${labels.status[project.status]} · ${getProjectYear(project)}`}
      descriptionClassName="lg:max-w-[720px]"
      className="lg:pb-16"
    >
      <SaveButton item={{ kind: SavedItemKind.PROJECT, refId: project.id }} />
    </PageIntro>
  ) : (
    <PageIntro
      header={<SiteHeader />}
      breadcrumb={breadcrumbRoot}
      title={isPending ? t.loadingTitle : t.notFoundTitle}
      description={isPending ? t.loadingDescription : t.notFoundDescription}
      className="lg:pb-16"
    />
  );

  return (
    <PageLayout footer={<SiteFooter />} intro={intro}>
      {project && (
        <>
          <ProjectBody project={project} />
          <RelatedProjects currentId={project.id} />
        </>
      )}
      {!project && !isPending && (
        <PageSection>
          <ListFeedback
            message={isError ? t.loadError : t.missing}
            actionLabel={isError ? common.tryAgain : t.backToProjects}
            onAction={() => (isError ? void refetch() : navigate(ROUTES.PROJECTS))}
          />
        </PageSection>
      )}
      <CtaSection
        title={t.ctaTitle}
        description={t.ctaDescription}
        action={{ label: t.ctaAction, to: ROUTES.CONTACT }}
      />
    </PageLayout>
  );
}
