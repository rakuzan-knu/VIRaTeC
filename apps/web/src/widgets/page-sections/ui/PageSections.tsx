import { useEffect, type ReactNode } from 'react';
import {
  resolveSections,
  type BuiltinSectionKey,
  type LayoutPage,
} from '@/shared/config/pageLayout';
import { PAGE_LAYOUTS } from '@/shared/config/pageLayouts.generated';
import { useContentPreviewStore, useLiveContent } from '@/shared/lib';
import { SectionToneProvider } from '@/shared/ui/page-section';
import { CustomSection } from './CustomSection';

export const PAGE_SECTION_ATTRIBUTE = 'data-page-section';

interface PageSectionsProps<P extends LayoutPage> {
  page: P;
  sections: Record<BuiltinSectionKey<P>, ReactNode>;
}

export function PageSections<P extends LayoutPage>({ page, sections }: PageSectionsProps<P>) {
  const layouts = useLiveContent('pageLayout', 'PAGE_LAYOUTS', PAGE_LAYOUTS);
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
    .filter((section) => !section.hidden)
    .map((section, index) => {
      const node =
        section.type === 'builtin' ? builtins[section.key] : <CustomSection section={section} />;
      return (
        <SectionToneProvider key={section.id} value={index % 2 === 0 ? 'base' : 'surface'}>
          {isPreview ? <div {...{ [PAGE_SECTION_ATTRIBUTE]: section.id }}>{node}</div> : node}
        </SectionToneProvider>
      );
    });
}
