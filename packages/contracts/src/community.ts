import { z } from 'zod';

export const CommunityPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  content: z.string().min(5),
  tags: z.array(z.string()).default([]),
  authorId: z.string().uuid(),
  likesCount: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CommunityPostDto = z.infer<typeof CommunityPostSchema>;

export const CreateCommunityPostSchema = CommunityPostSchema.omit({
  id: true,
  likesCount: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCommunityPostDto = z.infer<typeof CreateCommunityPostSchema>;
