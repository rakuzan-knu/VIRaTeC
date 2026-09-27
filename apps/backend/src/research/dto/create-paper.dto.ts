import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { FacultyDivision } from '@viratec/contracts';

export class CreatePaperDto {
  @ApiProperty({ example: 'Neural Architectures for Low-Resource Ukrainian NLP' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Abstract describing innovative research methodologies...' })
  @IsString()
  @IsNotEmpty()
  abstract: string;

  @ApiProperty({ example: ['Д-р Тарас Коваленко', 'Ірина Мельник'] })
  @IsArray()
  @IsString({ each: true })
  authors: string[];

  @ApiProperty({ enum: FacultyDivision, default: FacultyDivision.FIT })
  @IsEnum(FacultyDivision)
  primaryFaculty: FacultyDivision;

  @ApiProperty({ example: ['NLP', 'AI', 'Ukrainian Language', 'Transformers'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[] = [];

  @ApiProperty({ example: '10.1109/VIRATEC.2026.123456', required: false })
  @IsString()
  @IsOptional()
  doi?: string;

  @ApiProperty({ example: 'https://storage.viratec.knu.ua/docs/paper.pdf', required: false })
  @IsUrl()
  @IsOptional()
  fileUrl?: string;
}
