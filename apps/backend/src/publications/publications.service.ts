import { Injectable, NotFoundException } from '@nestjs/common';
import type { Publication } from '@prisma/client';
import { PublicationContentSchema, PublicationType, type PublicationDto } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';

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
  constructor(private prisma: PrismaService) {}

  async findAll(type?: PublicationType) {
    const publications = await this.prisma.publication.findMany({
      where: type ? { type } : undefined,
      orderBy: { position: 'asc' },
    });
    return publications.map(toPublicationDto);
  }

  async findBySlug(slug: string) {
    const publication = await this.prisma.publication.findUnique({ where: { slug } });

    if (!publication) {
      throw new NotFoundException(`Publication ${slug} not found`);
    }

    return toPublicationDto(publication);
  }
}
