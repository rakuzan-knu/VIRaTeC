export type PublicationType = 'paper' | 'news' | 'event' | 'media';

export type PublicationBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'quote'; text: string; author: string };

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
  detail?: PublicationDetail;
}
