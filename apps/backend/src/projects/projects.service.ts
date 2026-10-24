import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProjectTranslationsSchema, type CursorPage } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { TtlCache } from '../common/cache/ttl-cache';
import { cursorArgs, cursorCacheKey, toCursorPage } from '../common/pagination/cursor-page';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';

const CACHE_TTL_MS = 30_000;

const LEAD_SELECT = {
  id: true,
  name: true,
  faculty: true,
} satisfies Prisma.UserSelect;

const withTranslations = <T extends { translations: Prisma.JsonValue }>(project: T) => ({
  ...project,
  translations: project.translations ? ProjectTranslationsSchema.parse(project.translations) : null,
});

type ProjectWithLead = Prisma.ProjectGetPayload<{
  include: { lead: { select: typeof LEAD_SELECT } };
}>;
type ProjectDto = ReturnType<typeof withTranslations<ProjectWithLead>>;

@Injectable()
export class ProjectsService {
  private listCache = new TtlCache<CursorPage<ProjectDto>>(CACHE_TTL_MS);
  private itemCache = new TtlCache<ProjectDto>(CACHE_TTL_MS);

  constructor(private prisma: PrismaService) {}

  findAll(query: ListProjectsQueryDto) {
    const { tag } = query;
    return this.listCache.get(cursorCacheKey(query, tag), async () => {
      const projects = await this.prisma.project.findMany({
        where: tag ? { tags: { has: tag } } : undefined,
        include: { lead: { select: LEAD_SELECT } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        ...cursorArgs(query),
      });
      return toCursorPage(projects.map(withTranslations), query.limit);
    });
  }

  findById(id: string) {
    return this.itemCache.get(id, async () => {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: { lead: { select: LEAD_SELECT } },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return withTranslations(project);
    });
  }

  async create(dto: CreateProjectDto, leadId: string) {
    const project = await this.prisma.project.create({
      data: {
        ...dto,
        leadId,
      },
      include: { lead: { select: LEAD_SELECT } },
    });
    this.listCache.clear();
    return withTranslations(project);
  }
}
