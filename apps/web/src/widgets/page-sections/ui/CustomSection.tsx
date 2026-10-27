import type { CustomSectionItem } from '@/shared/config/pageLayout';
import { useLocale } from '@/shared/i18n';
import { toPageBlock } from '../lib/toPageBlock';
import { PageBlockView } from './blocks/PageBlockView';

export function CustomSection({ section }: { section: CustomSectionItem }) {
  const locale = useLocale();
  return (
    <PageBlockView block={toPageBlock(section, locale)} headingId={`section-${section.id}-title`} />
  );
}
