import { Link } from 'react-router-dom';
import { BookmarkX, FileText, FolderKanban, LoaderCircle } from 'lucide-react';
import { SavedItemKind, type SavedItemDto } from '@viratec/contracts';
import { findPublication, usePublications } from '@/entities/publication';
import { ROUTES, buildProjectPath, buildPublicationPath } from '@/shared/config/routes';
import { INTL_LOCALE, defineMessages, useLocale, useLocalized } from '@/shared/i18n';
import { Tooltip } from '@/shared/ui/Tooltip';
import { useSavedItems, useToggleSaved } from '../model/useSavedItems';

const SAVED_MESSAGES = defineMessages({
  en: {
    loading: 'Loading saved items…',
    error: 'Could not load saved items.',
    emptyTitle: 'Nothing saved yet',
    emptyDescription:
      'Use the “Save” button on publications and projects to keep them here, on every device.',
    browsePublications: 'Browse publications',
    browseProjects: 'Browse projects',
    publications: 'Publications',
    projects: 'Projects',
    unavailable: 'This item is no longer available',
    savedOn: (date: string) => `Saved ${date}`,
    remove: (title: string) => `Remove “${title}” from saved`,
    removeHint: 'Remove from saved',
  },
  uk: {
    loading: 'Завантажуємо збережене…',
    error: 'Не вдалося завантажити збережене.',
    emptyTitle: 'Поки нічого не збережено',
    emptyDescription:
      'Натискайте «Зберегти» на публікаціях і проєктах — вони з’являться тут на всіх ваших пристроях.',
    browsePublications: 'Переглянути публікації',
    browseProjects: 'Переглянути проєкти',
    publications: 'Публікації',
    projects: 'Проєкти',
    unavailable: 'Цей матеріал більше недоступний',
    savedOn: (date: string) => `Збережено ${date}`,
    remove: (title: string) => `Прибрати «${title}» зі збереженого`,
    removeHint: 'Прибрати зі збереженого',
  },
  de: {
    loading: 'Gespeicherte Elemente werden geladen…',
    error: 'Gespeicherte Elemente konnten nicht geladen werden.',
    emptyTitle: 'Noch nichts gespeichert',
    emptyDescription:
      'Verwenden Sie die Schaltfläche „Speichern“ bei Publikationen und Projekten, um sie hier auf allen Geräten aufzubewahren.',
    browsePublications: 'Publikationen durchsuchen',
    browseProjects: 'Projekte durchsuchen',
    publications: 'Publikationen',
    projects: 'Projekte',
    unavailable: 'Dieses Element ist nicht mehr verfügbar',
    savedOn: (date: string) => `Gespeichert ${date}`,
    remove: (title: string) => `„${title}“ aus Gespeichertem entfernen`,
    removeHint: 'Aus Gespeichertem entfernen',
  },
  fr: {
    loading: 'Chargement des éléments enregistrés…',
    error: 'Impossible de charger les éléments enregistrés.',
    emptyTitle: 'Rien d’enregistré pour l’instant',
    emptyDescription:
      'Utilisez le bouton « Enregistrer » sur les publications et projets pour les retrouver ici, sur tous vos appareils.',
    browsePublications: 'Parcourir les publications',
    browseProjects: 'Parcourir les projets',
    publications: 'Publications',
    projects: 'Projets',
    unavailable: 'Cet élément n’est plus disponible',
    savedOn: (date: string) => `Enregistré ${date}`,
    remove: (title: string) => `Retirer « ${title} » des éléments enregistrés`,
    removeHint: 'Retirer des éléments enregistrés',
  },
  ar: {
    loading: 'جارٍ تحميل العناصر المحفوظة…',
    error: 'تعذّر تحميل العناصر المحفوظة.',
    emptyTitle: 'لا شيء محفوظ بعد',
    emptyDescription: 'استخدم زر «حفظ» في المنشورات والمشاريع للاحتفاظ بها هنا على جميع أجهزتك.',
    browsePublications: 'تصفّح المنشورات',
    browseProjects: 'تصفّح المشاريع',
    publications: 'المنشورات',
    projects: 'المشاريع',
    unavailable: 'هذا العنصر لم يعد متاحًا',
    savedOn: (date: string) => `حُفظ ${date}`,
    remove: (title: string) => `إزالة «${title}» من المحفوظات`,
    removeHint: 'إزالة من المحفوظات',
  },
});

interface ResolvedItem {
  item: SavedItemDto;
  title: string;
  meta: string | null;
  to: string | null;
}

const LINK_CLASS =
  'rounded-full border border-white/22 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime';

export function SavedList() {
  const t = useLocalized(SAVED_MESSAGES);
  const locale = useLocale();
  const { publications, isPending: isPublicationsPending } = usePublications();
  const { data: items, isPending, isError } = useSavedItems();
  const toggle = useToggleSaved();
  const dateFormat = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'short',
  });

  if (isPending || isPublicationsPending) {
    return (
      <p className="flex items-center gap-2 text-sm text-viratec-muted">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        {t.loading}
      </p>
    );
  }

  if (isError || !items) {
    return (
      <p role="alert" className="text-sm text-state-error">
        {t.error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-xl font-medium text-white">{t.emptyTitle}</p>
          <p className="max-w-[52ch] text-[15px] leading-6 text-viratec-muted">
            {t.emptyDescription}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.PUBLICATIONS} className={LINK_CLASS}>
            {t.browsePublications}
          </Link>
          <Link to={ROUTES.PROJECTS} className={LINK_CLASS}>
            {t.browseProjects}
          </Link>
        </div>
      </div>
    );
  }

  const resolve = (item: SavedItemDto): ResolvedItem => {
    if (item.kind === SavedItemKind.PUBLICATION) {
      const publication = findPublication(publications, item.refId);
      return publication
        ? {
            item,
            title: publication.title,
            meta: publication.source.includes(String(publication.year))
              ? publication.source
              : `${publication.source} · ${publication.year}`,
            to: buildPublicationPath(publication.slug),
          }
        : { item, title: t.unavailable, meta: null, to: null };
    }
    return item.project
      ? { item, title: item.project.title, meta: null, to: buildProjectPath(item.project.id) }
      : { item, title: t.unavailable, meta: null, to: null };
  };

  const groups = [
    {
      kind: SavedItemKind.PUBLICATION,
      title: t.publications,
      icon: FileText,
    },
    { kind: SavedItemKind.PROJECT, title: t.projects, icon: FolderKanban },
  ]
    .map((group) => ({
      ...group,
      entries: items.filter((item) => item.kind === group.kind).map(resolve),
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ kind, title, icon: Icon, entries }) => (
        <section key={kind} className="flex flex-col gap-3">
          <h4 className="flex items-center gap-2 text-sm font-medium tracking-wide text-viratec-subtle uppercase">
            <Icon aria-hidden="true" className="size-4" />
            {title}
            <span className="text-viratec-muted">· {entries.length}</span>
          </h4>
          <ul className="flex flex-col divide-y divide-white/8 overflow-hidden rounded-[20px] border border-white/10 bg-white/3">
            {entries.map(({ item, title: itemTitle, meta, to }) => (
              <li key={`${item.kind}-${item.refId}`} className="flex items-center gap-3 p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {to ? (
                    <Link
                      to={to}
                      className="text-[15px] leading-6 font-medium text-white underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
                    >
                      {itemTitle}
                    </Link>
                  ) : (
                    <span className="text-[15px] text-viratec-subtle italic">{itemTitle}</span>
                  )}
                  <span className="text-xs text-viratec-subtle">
                    {[meta, t.savedOn(dateFormat.format(new Date(item.createdAt)))]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
                <Tooltip text={t.removeHint} className="shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      toggle.mutate({ item: { kind: item.kind, refId: item.refId }, save: false })
                    }
                    aria-label={t.remove(itemTitle)}
                    className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-viratec-subtle transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-viratec-lime"
                  >
                    <BookmarkX aria-hidden="true" className="size-[18px]" />
                  </button>
                </Tooltip>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
