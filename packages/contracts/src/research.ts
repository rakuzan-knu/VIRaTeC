import { z } from 'zod';
import { FacultyDivision } from './enums.js';

export const ResearchPaperSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  abstract: z.string().min(10),
  authors: z.array(z.string()).min(1),
  primaryFaculty: z.nativeEnum(FacultyDivision),
  keywords: z.array(z.string()).default([]),
  doi: z.string().optional(),
  fileUrl: z.string().url().optional(),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ResearchPaperDto = z.infer<typeof ResearchPaperSchema>;

export const CreateResearchPaperSchema = ResearchPaperSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateResearchPaperDto = z.infer<typeof CreateResearchPaperSchema>;
