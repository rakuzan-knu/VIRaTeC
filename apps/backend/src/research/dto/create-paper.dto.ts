import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { FacultyDivision } from '@viratec/contracts';

const PAPER_LIMITS = {
  titleMax: 300,
  abstractMax: 10_000,
  authorMax: 120,
  authorsMax: 50,
  keywordMax: 60,
  keywordsMax: 20,
  doiMax: 100,
  urlMax: 2048,
} as const;

export class CreatePaperDto {
  @ApiProperty({ example: 'Neural Architectures for Low-Resource Ukrainian NLP' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PAPER_LIMITS.titleMax)
  title!: string;

  @ApiProperty({ example: 'Abstract describing innovative research methodologies...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PAPER_LIMITS.abstractMax)
  abstract!: string;

  @ApiProperty({ example: ['Д-р Тарас Коваленко', 'Ірина Мельник'] })
  @IsArray()
  @ArrayMaxSize(PAPER_LIMITS.authorsMax)
  @IsString({ each: true })
  @MaxLength(PAPER_LIMITS.authorMax, { each: true })
  authors!: string[];

  @ApiProperty({ enum: FacultyDivision, default: FacultyDivision.FIT })
  @IsEnum(FacultyDivision)
  primaryFaculty!: FacultyDivision;

  @ApiProperty({ example: ['NLP', 'AI', 'Ukrainian Language', 'Transformers'] })
  @IsArray()
  @ArrayMaxSize(PAPER_LIMITS.keywordsMax)
  @IsString({ each: true })
  @MaxLength(PAPER_LIMITS.keywordMax, { each: true })
  @IsOptional()
  keywords?: string[] = [];

  @ApiProperty({ example: '10.1109/VIRATEC.2026.123456', required: false })
  @IsString()
  @MaxLength(PAPER_LIMITS.doiMax)
  @IsOptional()
  doi?: string;

  @ApiProperty({ example: 'https://storage.viratec.knu.ua/docs/paper.pdf', required: false })
  @IsUrl()
  @MaxLength(PAPER_LIMITS.urlMax)
  @IsOptional()
  fileUrl?: string;
}
