import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import type { Prisma } from '@prisma/client';
import { ListPapersQueryDto } from './dto/list-papers-query.dto';
import { cursorArgs, toCursorPage } from '../common/pagination/cursor-page';

const AUTHOR_SELECT = {
  id: true,
  name: true,
  faculty: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ListPapersQueryDto) {
    const { faculty } = query;
    const papers = await this.prisma.researchPaper.findMany({
      where: faculty ? { primaryFaculty: faculty } : undefined,
      include: { author: { select: AUTHOR_SELECT } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...cursorArgs(query),
    });
    return toCursorPage(papers, query.limit);
  }

  async findById(id: string) {
    const paper = await this.prisma.researchPaper.findUnique({
      where: { id },
      include: { author: { select: AUTHOR_SELECT } },
    });

    if (!paper) {
      throw new NotFoundException(`Research paper with ID ${id} not found`);
    }

    return paper;
  }

  async create(dto: CreatePaperDto, authorId: string) {
    return this.prisma.researchPaper.create({
      data: {
        ...dto,
        authorId,
      },
      include: { author: { select: AUTHOR_SELECT } },
    });
  }
}
