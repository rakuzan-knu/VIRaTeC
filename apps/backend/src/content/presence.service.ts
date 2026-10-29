import { Injectable } from '@nestjs/common';
import { PRESENCE_LIMITS, type EditorPresenceDto } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdatePresenceDto } from './dto/content-editor.dto';

@Injectable()
export class PresenceService {
  constructor(private prisma: PrismaService) {}

  async heartbeat(userId: string, dto: UpdatePresenceDto): Promise<EditorPresenceDto[]> {
    const keys = [...new Set(dto.resourceKeys)];
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.editorPresence.deleteMany({ where: { userId, resourceKey: { notIn: keys } } }),
      ...keys.map((resourceKey) =>
        this.prisma.editorPresence.upsert({
          where: { userId_resourceKey: { userId, resourceKey } },
          create: { userId, resourceKey },
          update: { updatedAt: now },
        }),
      ),
    ]);
    if (keys.length === 0) return [];
    const rows = await this.prisma.editorPresence.findMany({
      where: {
        resourceKey: { in: keys },
        userId: { not: userId },
        updatedAt: { gte: new Date(now.getTime() - PRESENCE_LIMITS.activeMs) },
      },
      orderBy: { updatedAt: 'desc' },
      select: { resourceKey: true, userId: true, user: { select: { name: true } } },
    });
    return rows.map((row) => ({
      resourceKey: row.resourceKey,
      userId: row.userId,
      name: row.user.name,
    }));
  }
}
