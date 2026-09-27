import { z } from 'zod';
import { ProjectStatus, FacultyDivision } from './enums.js';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.IDEA),
  faculties: z.array(z.nativeEnum(FacultyDivision)),
  tags: z.array(z.string()).default([]),
  repositoryUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  leadId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectDto = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
