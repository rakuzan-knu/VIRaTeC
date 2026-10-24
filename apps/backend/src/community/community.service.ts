import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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

  async findAll(query: ListPostsQueryDto) {
    const { tag } = query;
    const posts = await this.prisma.communityPost.findMany({
      where: tag ? { tags: { has: tag } } : undefined,
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...cursorArgs(query),
    });
    return toCursorPage(posts, query.limit);
  }

  async findById(id: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: { author: { select: AUTHOR_SELECT } },
    });

    if (!post) {
      throw new NotFoundException(`Community post with ID ${id} not found`);
    }

    return post;
  }

  async create(dto: CreatePostDto, authorId: string) {
    return this.prisma.communityPost.create({
      data: {
        ...dto,
        authorId,
      },
      include: { author: { select: AUTHOR_SELECT } },
    });
  }

  async like(id: string) {
    return this.prisma.communityPost.update({
      where: { id },
      data: {
        likesCount: { increment: 1 },
      },
    });
  }
}
