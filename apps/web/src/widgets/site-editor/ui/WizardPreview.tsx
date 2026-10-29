import {
  FacultyDivision,
  ProjectStatus,
  PublicationSchema,
  type RecordData,
  type RecordResource,
} from '@viratec/contracts';
import { ProjectCard } from '@/entities/project';
import { PublicationCard, toPublication } from '@/entities/publication';
import { INTL_LOCALE, useLocale } from '@/shared/i18n';
import { OpportunityCard } from '@/shared/ui/opportunity-card';
import type { SiteEditorMessages } from '../model/messages';

interface WizardPreviewProps {
  resource: RecordResource;
  data: RecordData;
  title: string;
  summary: string;
  cover: string | null;
  start: string;
  place: string;
  t: SiteEditorMessages;
}

export function WizardPreview({
  resource,
  data,
  title,
  summary,
  cover,
  start,
  place,
  t,
}: WizardPreviewProps) {
  const locale = useLocale();
  let card = null;

  if (resource === 'project') {
    const now = new Date().toISOString();
    card = (
      <ProjectCard
        project={{
          id: 'preview',
          title,
          description: summary,
          status: ProjectStatus.IDEA,
          faculties: [FacultyDivision.FIT],
          tags: [],
          coverUrl: cover,
          translations: null,
          leadId: null,
          lead: null,
          createdAt: now,
          updatedAt: now,
        }}
      />
    );
  } else if (resource === 'publication') {
    const parsed = PublicationSchema.safeParse(data);
    card = parsed.success ? (
      <PublicationCard publication={toPublication(parsed.data, locale)} />
    ) : null;
  } else {
    const date = new Date(start);
    const when = Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(date);
    card = (
      <OpportunityCard
        opportunity={{
          meta: [when, place.trim()].filter(Boolean).join(' · '),
          title,
          description: summary,
          actionLabel: t.wizard.eventAction,
        }}
      />
    );
  }

  return (
    <div inert className="pointer-events-none mx-auto w-full max-w-[400px]">
      {card}
    </div>
  );
}
