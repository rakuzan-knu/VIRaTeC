import type { Localized } from '../i18n/model/types.ts';

export const PAGE_BLOCK_TYPE_ID = 'pageBlock';

export const PAGE_BLOCK_KINDS = ['text', 'media', 'cards', 'stats', 'cta'] as const;

export type PageBlockKind = (typeof PAGE_BLOCK_KINDS)[number];

export const IMAGE_SIDES = ['left', 'right'] as const;

export type ImageSide = (typeof IMAGE_SIDES)[number];

export interface BlockCard {
  title: string;
  description: string;
  meta?: string;
  linkLabel?: string;
  to?: string;
  image?: string;
  imageAlt?: string;
}

export interface BlockStat {
  value: string;
  label: string;
}

export interface BlockAction {
  label: string;
  to?: string;
  href?: string;
}

export type PageBlock =
  | { kind: 'text'; eyebrow?: string; title: string; body: string }
  | {
      kind: 'media';
      eyebrow?: string;
      title: string;
      body: string;
      image?: string;
      imageAlt: string;
      imageSide: ImageSide;
    }
  | { kind: 'cards'; eyebrow?: string; title: string; description?: string; items: BlockCard[] }
  | { kind: 'stats'; title: string; description: string; items: BlockStat[] }
  | { kind: 'cta'; title: string; description: string; action: BlockAction };

export type PageBlocks = Localized<Record<string, PageBlock>>;
