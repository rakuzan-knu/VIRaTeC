import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe for containers' })
  check() {
    return {
      status: 'ok',
      service: 'viratec-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe verifying DB connectivity' })
  @ApiResponse({ status: 503, description: 'Database unreachable' })
  async ready(@Res({ passthrough: true }) reply: FastifyReply) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        database: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch {
      reply.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        status: 'degraded',
        database: 'unreachable',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
