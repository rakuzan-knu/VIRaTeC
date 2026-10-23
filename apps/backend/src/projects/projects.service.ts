import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ProjectTranslationsSchema } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

const withTranslations = <T extends { translations: Prisma.JsonValue }>(project: T) => ({
  ...project,
  translations: project.translations ? ProjectTranslationsSchema.parse(project.translations) : null,
});

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tag?: string) {
    const projects = await this.prisma.project.findMany({
      where: tag ? { tags: { has: tag } } : undefined,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            faculty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map(withTranslations);
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            faculty: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return withTranslations(project);
  }

  async create(dto: CreateProjectDto, leadId: string) {
    const project = await this.prisma.project.create({
      data: {
        ...dto,
        leadId,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            faculty: true,
          },
        },
      },
    });
    return withTranslations(project);
  }
}
