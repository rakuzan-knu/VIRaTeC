import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_EMAIL } from '@/shared/config/navigation';
import { cn, useSeo } from '@/shared/lib';
import { defineMessages, INTL_LOCALE, pickLocalized, useLocale, useLocalized } from '@/shared/i18n';
import { CtaSection } from '@/shared/ui/cta-section';
import { PageSection } from '@/shared/ui/page-section';
import { PageIntro } from '@/widgets/page-intro';
import { SiteHeader } from '@/widgets/site-header';
import { PageLayout } from '@/widgets/page-layout';
import { SiteFooter } from '@/widgets/site-footer';
import {
  LEGAL_DOCUMENT_ORDER,
  LEGAL_ROUTES,
  legalMeta,
  readingMinutes,
  useLegalDocuments,
} from '../model/documents';
import type { LegalDocument } from '../model/types';
import { ClearStorageCard } from './ClearStorageCard';
import { LegalSectionView } from './LegalSectionView';
import { LegalToc } from './LegalToc';

const LEGAL_MESSAGES = defineMessages({
  en: {
    eyebrow: 'Legal',
    documents: 'Legal documents',
    toc: 'On this page',
    summary: 'In short',
    meta: (date: string, version: string, minutes: number) =>
      `Last updated ${date} · Version ${version} · ${minutes} min read`,
    ctaTitle: 'Something unclear?',
    ctaDescription:
      'Legal texts should not be a puzzle. If anything here is confusing or you want to exercise your rights, just write to us.',
    ctaAction: 'Write to us',
  },
  uk: {
    eyebrow: 'Правова інформація',
    documents: 'Правові документи',
    toc: 'На цій сторінці',
    summary: 'Коротко',
    meta: (date: string, version: string, minutes: number) =>
      `Оновлено ${date} · Версія ${version} · ${minutes} хв читання`,
    ctaTitle: 'Щось незрозуміло?',
    ctaDescription:
      'Юридичні тексти не мають бути головоломкою. Якщо щось викликає питання або ви хочете скористатися своїми правами, просто напишіть нам.',
    ctaAction: 'Написати нам',
  },
  de: {
    eyebrow: 'Rechtliches',
    documents: 'Rechtliche Dokumente',
    toc: 'Auf dieser Seite',
    summary: 'Kurz gesagt',
    meta: (date: string, version: string, minutes: number) =>
      `Zuletzt aktualisiert ${date} · Version ${version} · ${minutes} Min. Lesezeit`,
    ctaTitle: 'Etwas unklar?',
    ctaDescription:
      'Rechtstexte sollten kein Rätsel sein. Wenn Ihnen etwas unklar ist oder Sie Ihre Rechte ausüben möchten, schreiben Sie uns einfach.',
    ctaAction: 'Schreiben Sie uns',
  },
  fr: {
    eyebrow: 'Mentions légales',
    documents: 'Documents juridiques',
    toc: 'Sur cette page',
    summary: 'En bref',
    meta: (date: string, version: string, minutes: number) =>
      `Dernière mise à jour ${date} · Version ${version} · ${minutes} min de lecture`,
    ctaTitle: 'Quelque chose n’est pas clair ?',
    ctaDescription:
      'Les textes juridiques ne devraient pas être une énigme. Si quelque chose vous semble confus ou si vous souhaitez exercer vos droits, écrivez-nous.',
    ctaAction: 'Nous écrire',
  },
  ar: {
    eyebrow: 'قانوني',
    documents: 'الوثائق القانونية',
    toc: 'في هذه الصفحة',
    summary: 'باختصار',
    meta: (date: string, version: string, minutes: number) =>
      `آخر تحديث ${date} · الإصدار ${version} · قراءة ${minutes} دقيقة`,
    ctaTitle: 'هل هناك ما هو غير واضح؟',
    ctaDescription:
      'لا ينبغي أن تكون النصوص القانونية لغزًا. إذا كان هناك ما يربكك أو أردت ممارسة حقوقك، فراسلنا ببساطة.',
    ctaAction: 'راسلنا',
  },
});

interface LegalPageProps {
  kind: LegalDocument;
}

export function LegalPage({ kind }: LegalPageProps) {
  const t = useLocalized(LEGAL_MESSAGES);
  const locale = useLocale();
  const documents = useLegalDocuments();
  const content = pickLocalized(documents[kind].content, locale);
  const minutes = useMemo(() => readingMinutes(content), [content]);
  const meta = legalMeta(documents[kind]);
  const updatedAt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { dateStyle: 'long' }).format(
    meta.updatedAt,
  );
  useSeo(content.title);

  return (
    <PageLayout
      header={<SiteHeader />}
      footer={<SiteFooter />}
      intro={
        <PageIntro
          eyebrow={t.eyebrow}
          title={content.title}
          accent={content.accent}
          description={content.description}
          tone="teal"
        >
          <p className="text-sm text-viratec-subtle">{t.meta(updatedAt, meta.version, minutes)}</p>
          <nav aria-label={t.documents} className="mt-2 lg:mt-4">
            <ul className="flex flex-wrap gap-2">
              {LEGAL_DOCUMENT_ORDER.map((documentKind) => {
                const isActive = documentKind === kind;
                return (
                  <li key={documentKind}>
                    <Link
                      to={LEGAL_ROUTES[documentKind]}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'inline-flex rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime lg:px-5 lg:py-2.5 lg:text-[15px]',
                        isActive
                          ? 'bg-viratec-lime text-viratec-ink'
                          : 'border border-white/14 bg-white/4 text-white hover:border-white/30 hover:bg-white/10',
                      )}
                    >
                      {pickLocalized(documents[documentKind].content, locale).title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </PageIntro>
      }
    >
      <PageSection containerClassName="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <LegalToc key={kind} label={t.toc} sections={content.sections} />
        <div>
          <article>
            {content.sections.map((section, index) => (
              <LegalSectionView
                key={section.id}
                section={section}
                index={index}
                summaryLabel={t.summary}
              />
            ))}
          </article>
          {kind === 'cookies' && <ClearStorageCard />}
        </div>
      </PageSection>

      <CtaSection
        title={t.ctaTitle}
        description={t.ctaDescription}
        action={{ label: t.ctaAction, href: `mailto:${CONTACT_EMAIL}` }}
      />
    </PageLayout>
  );
}
