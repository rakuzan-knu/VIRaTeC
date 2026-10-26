import { Injectable, NotFoundException } from '@nestjs/common';
import type { Publication } from '@prisma/client';
import { PublicationContentSchema, PublicationType, type PublicationDto } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { TtlCache } from '../common/cache/ttl-cache';

const CACHE_TTL_MS = 30_000;

const toPublicationDto = (publication: Publication): PublicationDto => ({
  slug: publication.slug,
  type: PublicationType[publication.type],
  year: publication.year,
  isFeatured: publication.isFeatured,
  readMoreLink: publication.readMoreLink,
  coverKey: publication.coverKey,
  sourceUrl: publication.sourceUrl,
  pdfUrl: publication.pdfUrl,
  detailSource: publication.detailSource,
  content: PublicationContentSchema.parse(publication.content),
});

@Injectable()
export class PublicationsService {
  private listCache = new TtlCache<PublicationDto[]>(CACHE_TTL_MS);
  private itemCache = new TtlCache<PublicationDto>(CACHE_TTL_MS);

  constructor(private prisma: PrismaService) {}

  clearCache() {
    this.listCache.clear();
    this.itemCache.clear();
  }

  findAll(type?: PublicationType) {
    return this.listCache.get(type ?? '', async () => {
      const publications = await this.prisma.publication.findMany({
        where: type ? { type } : undefined,
        orderBy: { position: 'asc' },
      });
      return publications.map(toPublicationDto);
    });
  }

  findBySlug(slug: string) {
    return this.itemCache.get(slug, async () => {
      const publication = await this.prisma.publication.findUnique({ where: { slug } });

      if (!publication) {
        throw new NotFoundException(`Publication ${slug} not found`);
      }

      return toPublicationDto(publication);
    });
  }
}
