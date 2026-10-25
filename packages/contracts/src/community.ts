import { z } from 'zod';

export const COMMUNITY_POST_LIMITS = {
  titleMin: 3,
  titleMax: 180,
  contentMin: 5,
  contentMax: 10_000,
  tagMax: 40,
  tagsMax: 10,
} as const;

export const CommunityPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(COMMUNITY_POST_LIMITS.titleMin).max(COMMUNITY_POST_LIMITS.titleMax),
  content: z.string().min(COMMUNITY_POST_LIMITS.contentMin).max(COMMUNITY_POST_LIMITS.contentMax),
  tags: z
    .array(z.string().min(1).max(COMMUNITY_POST_LIMITS.tagMax))
    .max(COMMUNITY_POST_LIMITS.tagsMax)
    .default([]),
  authorId: z.string().uuid(),
  likesCount: z.number().int().nonnegative().default(0),
  likedByMe: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CommunityPostDto = z.infer<typeof CommunityPostSchema>;

export const CreateCommunityPostSchema = CommunityPostSchema.omit({
  id: true,
  likesCount: true,
  likedByMe: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCommunityPostDto = z.infer<typeof CreateCommunityPostSchema>;

export const PostLikeResultSchema = z.object({
  liked: z.boolean(),
  likesCount: z.number().int().nonnegative(),
});

export type PostLikeResultDto = z.infer<typeof PostLikeResultSchema>;
