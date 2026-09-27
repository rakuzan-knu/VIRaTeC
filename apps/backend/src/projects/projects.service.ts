import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tag?: string) {
    return this.prisma.project.findMany({
      where: tag ? { tags: { has: tag } } : undefined,
      include: {
        lead: {
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
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            faculty: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async create(dto: CreateProjectDto, leadId: string) {
    return this.prisma.project.create({
      data: {
        ...dto,
        leadId,
      },
      include: {
        lead: {
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
