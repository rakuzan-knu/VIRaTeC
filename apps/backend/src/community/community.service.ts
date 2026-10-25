import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { PostLikeResultDto } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { cursorArgs, toCursorPage } from '../common/pagination/cursor-page';

const AUTHOR_SELECT = {
  id: true,
  name: true,
  faculty: true,
  role: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ListPostsQueryDto, viewerId: string | null) {
    const { tag } = query;
    const posts = await this.prisma.communityPost.findMany({
      where: tag ? { tags: { has: tag } } : undefined,
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...cursorArgs(query),
    });
    const page = toCursorPage(posts, query.limit);
    const liked = await this.likedPostIds(
      viewerId,
      page.data.map((post) => post.id),
    );
    return {
      ...page,
      data: page.data.map((post) => ({ ...post, likedByMe: liked.has(post.id) })),
    };
  }

  async findById(id: string, viewerId: string | null) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: { author: { select: AUTHOR_SELECT } },
    });

    if (!post) {
      throw new NotFoundException(`Community post with ID ${id} not found`);
    }

    return { ...post, likedByMe: await this.hasLiked(viewerId, id) };
  }

  async create(dto: CreatePostDto, authorId: string) {
    const post = await this.prisma.communityPost.create({
      data: { ...dto, authorId },
      include: { author: { select: AUTHOR_SELECT } },
    });
    return { ...post, likedByMe: false };
  }

  async toggleLike(postId: string, userId: string): Promise<PostLikeResultDto> {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) {
      throw new NotFoundException(`Community post with ID ${postId} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.postLike.deleteMany({ where: { postId, userId } });
      if (removed.count > 0) {
        const updated = await tx.communityPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
          select: { likesCount: true },
        });
        return { liked: false, likesCount: Math.max(0, updated.likesCount) };
      }

      const added = await tx.postLike.createMany({
        data: [{ postId, userId }],
        skipDuplicates: true,
      });
      if (added.count === 0) {
        const current = await tx.communityPost.findUniqueOrThrow({
          where: { id: postId },
          select: { likesCount: true },
        });
        return { liked: true, likesCount: current.likesCount };
      }

      const updated = await tx.communityPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true },
      });
      return { liked: true, likesCount: updated.likesCount };
    });
  }

  private async hasLiked(viewerId: string | null, postId: string) {
    if (!viewerId) return false;
    const like = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId: viewerId, postId } },
      select: { id: true },
    });
    return like !== null;
  }

  private async likedPostIds(viewerId: string | null, postIds: string[]): Promise<Set<string>> {
    if (!viewerId || postIds.length === 0) return new Set();
    const likes = await this.prisma.postLike.findMany({
      where: { userId: viewerId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(likes.map((like) => like.postId));
  }
}
