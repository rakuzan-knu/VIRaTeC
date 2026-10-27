import type { PageBlock, PageBlockKind } from '@/shared/config/pageBlock';

export interface BlockProps<K extends PageBlockKind> {
  block: Extract<PageBlock, { kind: K }>;
  headingId: string;
}
