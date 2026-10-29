import { LayoutList } from 'lucide-react';
import { PAGE_SECTIONS, type LayoutPage } from '@/shared/config/pageLayout';
import { useLocale, type Locale } from '@/shared/i18n';
import { stripFieldMarks } from '@/shared/lib';
import type { SiteEditorMessages } from '../model/messages';
import { useElementRects, type SectionTarget } from '../model/useCanvasTargets';

const MIN_TOP = 80;
const BADGE_HEIGHT = 28;
const BADGE_OFFSET = 12;

const sectionName = (section: SectionTarget, page: LayoutPage | null, locale: Locale) => {
  const builtin = page
    ? PAGE_SECTIONS[page].find((item) => `builtin-${item.key.toLowerCase()}` === section.sectionId)
    : undefined;
  if (builtin) return builtin.label[locale];
  const heading = section.element.querySelector('h1, h2, h3');
  return stripFieldMarks(heading?.textContent ?? '').trim();
};

export function SectionBadge({
  section,
  page,
  t,
  onSelect,
  onOpen,
}: {
  section: SectionTarget;
  page: LayoutPage | null;
  t: SiteEditorMessages;
  onSelect: (target: SectionTarget) => void;
  onOpen: (target: SectionTarget) => void;
}) {
  const locale = useLocale();
  const [rect] = useElementRects(section.element);
  if (!rect) return null;

  const name = sectionName(section, page, locale);
  const text = name ? `${t.structure.section} · ${name}` : t.structure.section;
  const top = Math.min(Math.max(rect.top + BADGE_OFFSET, MIN_TOP), rect.bottom - BADGE_HEIGHT);

  return (
    <>
      {rect.top >= 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[2147483001] h-px bg-viratec-cyan/50 motion-safe:animate-editor-badge-in"
          style={{ top: rect.top, left: rect.left, width: rect.width }}
        />
      )}
      <button
        type="button"
        title={t.structure.sectionHint}
        aria-label={`${text}. ${t.structure.sectionHint}`}
        onClick={(event) => (event.detail === 0 ? onOpen(section) : onSelect(section))}
        onDoubleClick={() => onOpen(section)}
        className="fixed z-[2147483002] inline-flex motion-safe:animate-editor-badge-in max-w-[min(360px,70vw)] cursor-pointer items-center gap-1.5 rounded-full border border-viratec-cyan/50 bg-viratec-deep/90 px-2.5 py-1 text-[12px] leading-5 font-medium text-viratec-cyan backdrop-blur-sm transition-colors hover:border-viratec-cyan hover:bg-viratec-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
        style={{ top, left: rect.left + BADGE_OFFSET }}
      >
        <LayoutList aria-hidden="true" className="size-3.5 shrink-0" />
        <span className="truncate">{text}</span>
      </button>
    </>
  );
}
