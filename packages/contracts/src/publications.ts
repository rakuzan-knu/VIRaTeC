import { z } from 'zod';
import { PublicationType } from './enums.js';

export const PublicationBlockSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('paragraph'), text: z.string() }),
  z.object({ kind: z.literal('heading'), text: z.string() }),
  z.object({ kind: z.literal('quote'), text: z.string(), author: z.string() }),
]);

export const PublicationDetailTextSchema = z.object({
  heroTitle: z.string(),
  heroAccent: z.string(),
  lead: z.string(),
  formatLabel: z.string(),
  kindLabel: z.string(),
  publishedOn: z.string(),
  readTime: z.string(),
  blocks: z.array(PublicationBlockSchema),
  authors: z.string(),
  sourceLabel: z.string(),
});

export const PublicationTextSchema = z.object({
  title: z.string(),
  source: z.string(),
  excerpt: z.string(),
  detail: PublicationDetailTextSchema.optional(),
});

export type PublicationText = z.infer<typeof PublicationTextSchema>;

export const PublicationContentSchema = z.object({
  en: PublicationTextSchema,
  uk: PublicationTextSchema,
});

export type PublicationContent = z.infer<typeof PublicationContentSchema>;

export const PublicationSchema = z.object({
  slug: z.string(),
  type: z.nativeEnum(PublicationType),
  year: z.number().int(),
  isFeatured: z.boolean(),
  readMoreLink: z.boolean(),
  coverKey: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  pdfUrl: z.string().nullable(),
  detailSource: z.string().nullable(),
  content: PublicationContentSchema,
});

export type PublicationDto = z.infer<typeof PublicationSchema>;
