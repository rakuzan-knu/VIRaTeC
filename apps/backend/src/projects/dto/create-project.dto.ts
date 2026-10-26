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
import { ProjectStatus, FacultyDivision } from '@viratec/contracts';

const PROJECT_LIMITS = {
  titleMax: 200,
  descriptionMax: 10_000,
  tagMax: 40,
  tagsMax: 20,
  urlMax: 2048,
} as const;

export class CreateProjectDto {
  @ApiProperty({ example: 'KNU AI-Powered Academic Assistant' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PROJECT_LIMITS.titleMax)
  title!: string;

  @ApiProperty({
    example: 'Collaborative interdisciplinary project combining FIT AI with Philology NLP.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PROJECT_LIMITS.descriptionMax)
  description!: string;

  @ApiProperty({ enum: ProjectStatus, default: ProjectStatus.IDEA })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus = ProjectStatus.IDEA;

  @ApiProperty({
    enum: FacultyDivision,
    isArray: true,
    example: [FacultyDivision.FIT, FacultyDivision.NNIF],
  })
  @IsArray()
  @ArrayMaxSize(Object.keys(FacultyDivision).length)
  @IsEnum(FacultyDivision, { each: true })
  faculties!: FacultyDivision[];

  @ApiProperty({ example: ['React', 'NestJS', 'LLM', 'FastAPI'], required: false })
  @IsArray()
  @ArrayMaxSize(PROJECT_LIMITS.tagsMax)
  @IsString({ each: true })
  @MaxLength(PROJECT_LIMITS.tagMax, { each: true })
  @IsOptional()
  tags?: string[] = [];

  @ApiProperty({ example: 'https://github.com/viratec-knu/assistant', required: false })
  @IsUrl()
  @MaxLength(PROJECT_LIMITS.urlMax)
  @IsOptional()
  repositoryUrl?: string;

  @ApiProperty({ example: 'https://assistant.viratec.knu.ua', required: false })
  @IsUrl()
  @MaxLength(PROJECT_LIMITS.urlMax)
  @IsOptional()
  demoUrl?: string;
}
