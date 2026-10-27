import { useEffect, type ReactNode } from 'react';
import { PAGE_BLOCK_TYPE_ID } from '@/shared/config/pageBlock';
import { PAGE_BLOCKS } from '@/shared/config/pageBlocks.generated';
import {
  resolveSections,
  type BuiltinSectionKey,
  type LayoutPage,
} from '@/shared/config/pageLayout';
import { PAGE_LAYOUTS } from '@/shared/config/pageLayouts.generated';
import { useLocale } from '@/shared/i18n';
import { useContentPreviewStore, useLiveContent } from '@/shared/lib';
import { SectionToneProvider } from '@/shared/ui/page-section';
import { PageBlockView } from './blocks/PageBlockView';
import { CustomSection } from './CustomSection';

export const PAGE_SECTION_ATTRIBUTE = 'data-page-section';

interface PageSectionsProps<P extends LayoutPage> {
  page: P;
  sections: Record<BuiltinSectionKey<P>, ReactNode>;
}

export function PageSections<P extends LayoutPage>({ page, sections }: PageSectionsProps<P>) {
  const locale = useLocale();
  const layouts = useLiveContent('pageLayout', 'PAGE_LAYOUTS', PAGE_LAYOUTS);
  const blocks = useLiveContent(PAGE_BLOCK_TYPE_ID, 'PAGE_BLOCKS', PAGE_BLOCKS)[locale];
  const isPreview = useContentPreviewStore((state) => state.enabled);
  const override = useContentPreviewStore((state) =>
    state.layoutOverride?.page === page ? state.layoutOverride.sections : undefined,
  );
  const setActiveLayout = useContentPreviewStore((state) => state.setActiveLayout);
  const layout = layouts[page];
  const entryId = layout?.entryId ?? null;

  useEffect(() => {
    if (!isPreview) return;
    setActiveLayout({ page, entryId });
    return () => setActiveLayout(null);
  }, [isPreview, page, entryId, setActiveLayout]);

  const builtins: Record<string, ReactNode> = sections;

  return resolveSections(page, override ?? layout?.sections)
    .filter((section) => !section.hidden && (section.type !== 'block' || blocks[section.blockId]))
    .map((section, index) => {
      const block = section.type === 'block' ? blocks[section.blockId] : undefined;
      const node =
        section.type === 'builtin' ? (
          builtins[section.key]
        ) : section.type === 'block' ? (
          block && <PageBlockView block={block} headingId={`section-${section.id}-title`} />
        ) : (
          <CustomSection section={section} />
        );
      return (
        <SectionToneProvider key={section.id} value={index % 2 === 0 ? 'base' : 'surface'}>
          {isPreview ? <div {...{ [PAGE_SECTION_ATTRIBUTE]: section.id }}>{node}</div> : node}
        </SectionToneProvider>
      );
    });
}
