import type { PageBlock } from '@/shared/config/pageBlock';
import { CardsBlock } from './CardsBlock';
import { CtaBlock } from './CtaBlock';
import { MediaBlock } from './MediaBlock';
import { StatsBlock } from './StatsBlock';
import { TextBlock } from './TextBlock';

interface PageBlockViewProps {
  block: PageBlock;
  headingId: string;
}

export function PageBlockView({ block, headingId }: PageBlockViewProps) {
  switch (block.kind) {
    case 'text':
      return <TextBlock block={block} headingId={headingId} />;
    case 'media':
      return <MediaBlock block={block} headingId={headingId} />;
    case 'cards':
      return <CardsBlock block={block} headingId={headingId} />;
    case 'stats':
      return <StatsBlock block={block} headingId={headingId} />;
    case 'cta':
      return <CtaBlock block={block} headingId={headingId} />;
  }
}
