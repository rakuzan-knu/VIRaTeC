import type { ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  FolderKanban,
  Globe2,
  GraduationCap,
  Languages,
  Lock,
  Mail,
  Pencil,
} from 'lucide-react';
import { PROFILE_LINK_KEYS, buildProfileLinkUrl, type PublicProfileDto } from '@viratec/contracts';
import { usePublicProfile } from '@/entities/person';
import { UserAvatar, useAccountLabels, useSessionStore } from '@/entities/session';
import { ApiError } from '@/shared/api/apiClient';
import { ROUTES, buildProjectPath } from '@/shared/config/routes';
import { INTL_LOCALE, defineMessages, useLocale, useLocalized } from '@/shared/i18n';
import { cn, useSeo } from '@/shared/lib';
import { useIntlNames } from '@/shared/lib/intlNames';
import { LinkButton, linkButtonClassName } from '@/shared/ui/link-button';
import { PageIntro } from '@/widgets/page-intro';
import { PageLayout } from '@/widgets/page-layout';

const PERSON_MESSAGES = defineMessages({
  en: {
    home: 'Home',
    community: 'Community',
    loading: 'Loading profile…',
    about: 'About',
    noBio: 'This member hasn’t written a bio yet.',
    interests: 'Research interests',
    languages: 'Languages',
    profiles: 'Academic profiles',
    projects: 'Projects',
    papers: 'Papers',
    openTo: 'Open to',
    contact: 'Contact',
    memberSince: (date: string) => `Member since ${date}`,
    editProfile: 'Edit profile',
    ownerHint: (audience: string) =>
      `You are viewing your profile as others see it · Visible to: ${audience}`,
    membersOnlyTitle: 'Members-only profile',
    membersOnlyDescription: 'Sign in to the VIRaTeC community to see this profile.',
    signIn: 'Sign in',
    notFoundTitle: 'Profile not found',
    notFoundDescription: 'This profile doesn’t exist or its owner keeps it private.',
    errorTitle: 'Profile unavailable',
    errorDescription: 'We could not load this profile. Please try again later.',
    backHome: 'Back to home',
  },
  uk: {
    home: 'Головна',
    community: 'Спільнота',
    loading: 'Завантажуємо профіль…',
    about: 'Про себе',
    noBio: 'Учасник ще не додав опис.',
    interests: 'Дослідницькі інтереси',
    languages: 'Мови',
    profiles: 'Академічні профілі',
    projects: 'Проєкти',
    papers: 'Публікації',
    openTo: 'Відкритий до',
    contact: 'Контакт',
    memberSince: (date: string) => `У спільноті з ${date}`,
    editProfile: 'Редагувати профіль',
    ownerHint: (audience: string) =>
      `Ви бачите свій профіль так, як його бачать інші · Видимість: ${audience}`,
    membersOnlyTitle: 'Профіль лише для учасників',
    membersOnlyDescription: 'Увійдіть до спільноти VIRaTeC, щоб переглянути цей профіль.',
    signIn: 'Увійти',
    notFoundTitle: 'Профіль не знайдено',
    notFoundDescription: 'Такого профілю немає або власник зробив його приватним.',
    errorTitle: 'Профіль недоступний',
    errorDescription: 'Не вдалося завантажити профіль. Спробуйте пізніше.',
    backHome: 'На головну',
  },
});

type PersonMessages = (typeof PERSON_MESSAGES)['en'];

const CARD_CLASS = 'rounded-[28px] border border-white/10 bg-viratec-deep/80 p-6 lg:p-8';

function ProfileCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(CARD_CLASS, className)}>
      <h2 className="mb-4 flex items-center gap-2.5 font-display text-lg leading-6 font-medium tracking-[-0.01em] text-white">
        <span className="text-viratec-accent">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ProfileState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <PageLayout
      intro={
        <PageIntro title={title} description={description} className="lg:pb-28">
          {action}
        </PageIntro>
      }
    >
      {null}
    </PageLayout>
  );
}

function ProfileContent({ profile, t }: { profile: PublicProfileDto; t: PersonMessages }) {
  const labels = useAccountLabels();
  const locale = useLocale();
  const { countryName, languageName } = useIntlNames();

  const headline = [
    profile.studyLevel
      ? [
          labels.studyLevel[profile.studyLevel],
          profile.studyYear && labels.studyYear(profile.studyYear),
        ]
          .filter(Boolean)
          .join(', ')
      : labels.role[profile.role as keyof typeof labels.role],
    profile.institution,
    profile.country && countryName(profile.country),
  ]
    .filter(Boolean)
    .join(' · ');

  const memberSince = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(
    new Date(profile.createdAt),
  );

  const links = PROFILE_LINK_KEYS.filter((key) => profile.links[key]);

  return (
    <PageLayout
      intro={
        <PageIntro
          breadcrumb={[
            { label: t.home, to: ROUTES.HOME },
            { label: t.community, to: ROUTES.PEOPLE },
            profile.name,
          ]}
          eyebrow={labels.faculty[profile.faculty as keyof typeof labels.faculty]}
          title={profile.name}
          description={headline || t.memberSince(memberSince)}
          className="lg:pb-16"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <UserAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              className="size-24 text-3xl ring-4 ring-white/10 lg:size-28"
            />
            <div className="flex flex-col gap-3">
              {profile.openTo.length > 0 && (
                <ul aria-label={t.openTo} className="flex flex-wrap gap-2">
                  {profile.openTo.map((option) => (
                    <li
                      key={option}
                      className="inline-flex items-center gap-1.5 rounded-full border border-viratec-lime/40 bg-viratec-lime/12 px-3.5 py-1.5 text-sm font-medium text-viratec-accent"
                    >
                      {labels.openTo[option]}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-viratec-subtle">{t.memberSince(memberSince)}</p>
            </div>
          </div>
          {profile.isOwner && (
            <div className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-viratec-muted">
                {t.ownerHint(labels.visibility[profile.visibility])}
              </p>
              <Link
                to={ROUTES.ACCOUNT}
                className={linkButtonClassName({
                  size: 'md',
                  variant: 'secondary',
                  className: 'shrink-0',
                })}
              >
                <Pencil aria-hidden="true" className="size-4" />
                {t.editProfile}
              </Link>
            </div>
          )}
        </PageIntro>
      }
    >
      <div className="mx-auto grid max-w-[1440px] gap-4 px-5 pb-[72px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6 lg:px-[85px] lg:pb-[120px]">
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
                    {profile.projects.map((project) => (
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
                </ProfileCard>
              )}
              {profile.papers.length > 0 && (
                <ProfileCard title={t.papers} icon={<BookOpen className="size-5" />}>
                  <ul className="flex flex-col gap-3">
                    {profile.papers.map((paper) => (
                      <li key={paper.id} className="text-[15px] leading-6 text-white">
                        {paper.title}
                        <span className="block text-xs text-viratec-subtle">
                          {new Date(paper.createdAt).getFullYear()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ProfileCard>
              )}
            </div>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4 lg:gap-6">
          {(links.length > 0 || profile.email) && (
            <ProfileCard title={t.profiles} icon={<Globe2 className="size-5" />}>
              <ul className="flex flex-col gap-1">
                {profile.email && (
                  <li>
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-3 rounded-[14px] px-2 py-2.5 text-[15px] text-white transition-colors hover:bg-white/6"
                    >
                      <Mail aria-hidden="true" className="size-4 text-viratec-subtle" />
                      <span className="min-w-0 truncate">{profile.email}</span>
                    </a>
                  </li>
                )}
                {links.map((key) => (
                  <li key={key}>
                    <a
                      href={buildProfileLinkUrl(key, profile.links[key])}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="group flex items-center justify-between gap-3 rounded-[14px] px-2 py-2.5 text-[15px] text-white transition-colors hover:bg-white/6"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="font-medium">{labels.links[key]}</span>
                        <span className="truncate text-xs text-viratec-subtle">
                          {profile.links[key]}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-viratec-subtle transition-colors group-hover:text-viratec-accent"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </ProfileCard>
          )}

          {profile.languages.length > 0 && (
            <ProfileCard title={t.languages} icon={<Languages className="size-5" />}>
              <ul className="flex flex-col divide-y divide-white/8">
                {profile.languages.map((language) => (
                  <li
                    key={language.code}
                    className="flex items-center justify-between gap-3 py-2.5 text-[15px] first:pt-0 last:pb-0"
                  >
                    <span className="text-white">{languageName(language.code)}</span>
                    <span className="text-sm text-viratec-muted">
                      {labels.languageLevel[language.level]}
                    </span>
                  </li>
                ))}
              </ul>
            </ProfileCard>
          )}
        </aside>
      </div>
    </PageLayout>
  );
}

export function PersonPage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const t = useLocalized(PERSON_MESSAGES);
  const viewerId = useSessionStore((state) => state.user?.id ?? null);
  const { data: profile, error, isPending } = usePublicProfile(userId, viewerId);
  const isPublic = profile?.visibility === 'PUBLIC';
  useSeo(profile?.name ?? t.community, { noindex: !isPublic });

  if (isPending) {
    return (
      <ProfileState
        title={t.loading}
        description=" "
        action={<span className="sr-only">{t.loading}</span>}
      />
    );
  }

  if (error instanceof ApiError && error.status === 401) {
    return (
      <ProfileState
        title={t.membersOnlyTitle}
        description={t.membersOnlyDescription}
        action={
          <Link
            to={ROUTES.LOGIN}
            state={{ from: location.pathname }}
            className={linkButtonClassName({ className: 'mt-2 w-full sm:w-auto' })}
          >
            <Lock aria-hidden="true" className="size-[18px]" />
            {t.signIn}
          </Link>
        }
      />
    );
  }

  if (!profile) {
    const isMissing = error instanceof ApiError && [400, 404].includes(error.status);
    return (
      <ProfileState
        title={isMissing ? t.notFoundTitle : t.errorTitle}
        description={isMissing ? t.notFoundDescription : t.errorDescription}
        action={
          <LinkButton to={ROUTES.HOME} className="mt-2 w-full sm:w-auto">
            {t.backHome}
          </LinkButton>
        }
      />
    );
  }

  return <ProfileContent profile={profile} t={t} />;
}
