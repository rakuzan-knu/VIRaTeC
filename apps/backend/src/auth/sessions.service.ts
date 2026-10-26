import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sha256Hex } from '../security/crypto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: sha256Hex(refreshToken), revoked: false },
      data: { revoked: true },
    });
    return { success: true };
  }

  async logoutAll(userId: string) {
    await this.revokeAll(userId);
    return { success: true };
  }

  async revokeAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async listSessions(userId: string, currentSessionId?: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
      select: {
        sessionId: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });

    const sessions = new Map<string, (typeof tokens)[number]>();
    for (const token of tokens) {
      if (!sessions.has(token.sessionId)) sessions.set(token.sessionId, token);
    }

    return [...sessions.values()].map(({ sessionId, ...session }) => ({
      id: sessionId,
      ...session,
      isCurrent: sessionId === currentSessionId,
    }));
  }

  async eraseOtherSessions(userId: string, currentSessionId?: string) {
    const { count } = await this.prisma.refreshToken.deleteMany({
      where: currentSessionId
        ? { userId, sessionId: { not: currentSessionId } }
        : { userId, OR: [{ revoked: true }, { expiresAt: { lt: new Date() } }] },
    });
    return { removed: count };
  }

  async revokeSession(userId: string, sessionId: string) {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { userId, sessionId, revoked: false },
      data: { revoked: true },
    });
    if (count === 0) {
      throw new NotFoundException('Session not found');
    }
    return { success: true };
  }
}
