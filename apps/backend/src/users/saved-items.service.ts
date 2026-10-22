import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SavedItemKind } from '@prisma/client';
import { SAVED_ITEMS_MAX } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { SavedItemDto } from './dto/saved-item.dto';

@Injectable()
export class SavedItemsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.savedItem.findMany({
      where: { userId },
      select: { kind: true, refId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const projectIds = items
      .filter((item) => item.kind === SavedItemKind.PROJECT)
      .map((item) => item.refId);
    const projects = projectIds.length
      ? await this.prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { id: true, title: true, status: true },
        })
      : [];
    const projectsById = new Map(projects.map((project) => [project.id, project]));

    return items.map((item) => ({
      ...item,
      project: item.kind === SavedItemKind.PROJECT ? (projectsById.get(item.refId) ?? null) : null,
    }));
  }

  async save(userId: string, { kind, refId }: SavedItemDto) {
    if (kind === SavedItemKind.PROJECT) {
      const project = await this.prisma.project.findUnique({
        where: { id: refId },
        select: { id: true },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
    }

    const existing = await this.prisma.savedItem.findUnique({
      where: { userId_kind_refId: { userId, kind, refId } },
      select: { id: true },
    });
    if (!existing) {
      const count = await this.prisma.savedItem.count({ where: { userId } });
      if (count >= SAVED_ITEMS_MAX) {
        throw new BadRequestException(`You can save up to ${SAVED_ITEMS_MAX} items`);
      }
      await this.prisma.savedItem.upsert({
        where: { userId_kind_refId: { userId, kind, refId } },
        create: { userId, kind, refId },
        update: {},
      });
    }

    return this.list(userId);
  }

  async clear(userId: string) {
    await this.prisma.savedItem.deleteMany({ where: { userId } });
    return [];
  }

  async remove(userId: string, { kind, refId }: SavedItemDto) {
    await this.prisma.savedItem.deleteMany({ where: { userId, kind, refId } });
    return this.list(userId);
  }
}
