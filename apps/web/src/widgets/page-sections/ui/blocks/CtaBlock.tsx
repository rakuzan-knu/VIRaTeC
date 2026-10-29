import { CtaSection } from '@/shared/ui/cta-section';
import type { BlockProps } from './types';

export function CtaBlock({ block }: BlockProps<'cta'>) {
  return <CtaSection title={block.title} description={block.description} action={block.action} />;
}
