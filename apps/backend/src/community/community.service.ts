import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async findAll(tag?: string) {
    return this.prisma.communityPost.findMany({
      where: tag ? { tags: { has: tag } } : undefined,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            faculty: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            faculty: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
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
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            faculty: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
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
