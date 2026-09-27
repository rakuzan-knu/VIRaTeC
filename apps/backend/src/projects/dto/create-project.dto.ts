import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ProjectStatus, FacultyDivision } from '@viratec/contracts';

export class CreateProjectDto {
  @ApiProperty({ example: 'KNU AI-Powered Academic Assistant' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Collaborative interdisciplinary project combining FIT AI with Philology NLP.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

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
  @IsEnum(FacultyDivision, { each: true })
  faculties: FacultyDivision[];

  @ApiProperty({ example: ['React', 'NestJS', 'LLM', 'FastAPI'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @ApiProperty({ example: 'https://github.com/viratec-knu/assistant', required: false })
  @IsUrl()
  @IsOptional()
  repositoryUrl?: string;

  @ApiProperty({ example: 'https://assistant.viratec.knu.ua', required: false })
  @IsUrl()
  @IsOptional()
  demoUrl?: string;
}
