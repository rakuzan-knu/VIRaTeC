import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

const DEFAULT_SLOW_QUERY_MS = 200;

type PrismaOptions = {
  log: [
    { emit: 'event'; level: 'query' },
    { emit: 'stdout'; level: 'warn' },
    { emit: 'stdout'; level: 'error' },
  ];
};

@Injectable()
export class PrismaService
  extends PrismaClient<PrismaOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly slowQueryMs = Number(process.env.SLOW_QUERY_MS) || DEFAULT_SLOW_QUERY_MS;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
    this.$on('query', (event: Prisma.QueryEvent) => {
      if (event.duration >= this.slowQueryMs) {
        this.logger.warn(`Slow query (${event.duration}ms): ${event.query}`);
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
