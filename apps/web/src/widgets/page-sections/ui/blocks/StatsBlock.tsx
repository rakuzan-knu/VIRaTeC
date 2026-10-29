import { HighlightBanner } from '@/shared/ui/highlight-banner';
import { PageSection } from '@/shared/ui/page-section';
import type { BlockProps } from './types';

export function StatsBlock({ block }: BlockProps<'stats'>) {
  return (
    <PageSection>
      <HighlightBanner title={block.title} description={block.description} stats={block.items} />
    </PageSection>
  );
}
