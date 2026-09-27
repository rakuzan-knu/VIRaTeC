import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { FacultyDivision } from '@viratec/contracts';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async findAll(faculty?: FacultyDivision) {
    return this.prisma.researchPaper.findMany({
      where: faculty ? { primaryFaculty: faculty } : undefined,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            faculty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const paper = await this.prisma.researchPaper.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            faculty: true,
          },
        },
      },
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
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            faculty: true,
          },
        },
      },
    });
  }
}
