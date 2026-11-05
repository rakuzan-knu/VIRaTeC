import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { CursorPage } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { ListPapersQueryDto } from './dto/list-papers-query.dto';
import { TtlCache } from '../common/cache/ttl-cache';
import { cursorArgs, cursorCacheKey, toCursorPage } from '../common/pagination/cursor-page';

const CACHE_TTL_MS = 30_000;

const AUTHOR_SELECT = {
  id: true,
  name: true,
  faculty: true,
} satisfies Prisma.UserSelect;

type PaperDto = Prisma.ResearchPaperGetPayload<{
  include: { author: { select: typeof AUTHOR_SELECT } };
}>;

@Injectable()
export class ResearchService {
  private listCache = new TtlCache<CursorPage<PaperDto>>(CACHE_TTL_MS);
  private itemCache = new TtlCache<PaperDto>(CACHE_TTL_MS);

  constructor(private prisma: PrismaService) {}

  clearCache() {
    this.listCache.clear();
    this.itemCache.clear();
  }

  findAll(query: ListPapersQueryDto) {
    const { faculty } = query;
    return this.listCache.get(
      cursorCacheKey(query, faculty ? String(faculty) : undefined),
      async () => {
        const papers = await this.prisma.researchPaper.findMany({
          where: faculty ? { primaryFaculty: faculty } : undefined,
          include: { author: { select: AUTHOR_SELECT } },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          ...cursorArgs(query),
        });
        return toCursorPage(papers, query.limit);
      },
    );
  }

  findById(id: string) {
    return this.itemCache.get(id, async () => {
      const paper = await this.prisma.researchPaper.findUnique({
        where: { id },
        include: { author: { select: AUTHOR_SELECT } },
      });

      if (!paper) {
        throw new NotFoundException(`Research paper with ID ${id} not found`);
      }

      return paper;
    });
  }

  async create(dto: CreatePaperDto, authorId: string) {
    const paper = await this.prisma.researchPaper.create({
      data: {
        ...dto,
        authorId,
      },
      include: { author: { select: AUTHOR_SELECT } },
    });
    this.listCache.clear();
    return paper;
  }
}
