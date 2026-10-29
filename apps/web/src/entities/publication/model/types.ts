import type { PublicationBlockDto } from '@viratec/contracts';

export type PublicationType = 'paper' | 'news' | 'event' | 'media';

export type PublicationBlock = PublicationBlockDto;

export interface PublicationDetail {
  heroTitle: string;
  heroAccent: string;
  lead: string;
  formatLabel: string;
  kindLabel: string;
  publishedOn: string;
  readTime: string;
  blocks: PublicationBlock[];
  authors: string;
  sourceLabel: string;
  pdfUrl?: string;
  sourceUrl?: string;
}

export interface Publication {
  slug: string;
  type: PublicationType;
  year: number;
  title: string;
  source: string;
  excerpt: string;
  linkLabel: string;
  isFeatured?: boolean;
  image?: string;
  imageFocus?: string;
  coverAlt?: string;
  sourceUrl?: string;
  detail?: PublicationDetail;
}
