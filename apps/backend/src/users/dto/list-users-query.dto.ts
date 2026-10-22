import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import { FacultyDivision, OpenToOption, PEOPLE_PAGE_LIMITS, StudyLevel } from '@viratec/contracts';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class ListUsersQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, institution, department, bio or skill' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(PEOPLE_PAGE_LIMITS.queryMax)
  q?: string;

  @ApiPropertyOptional({ enum: OpenToOption })
  @IsOptional()
  @IsEnum(OpenToOption)
  openTo?: OpenToOption;

  @ApiPropertyOptional({ enum: FacultyDivision })
  @IsOptional()
  @IsEnum(FacultyDivision)
  faculty?: FacultyDivision;

  @ApiPropertyOptional({ enum: StudyLevel })
  @IsOptional()
  @IsEnum(StudyLevel)
  studyLevel?: StudyLevel;

  @ApiPropertyOptional({ example: 'UA' })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  country?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @Matches(/^[a-z]{2,3}$/)
  language?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: PEOPLE_PAGE_LIMITS.pageSizeDefault })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PEOPLE_PAGE_LIMITS.pageSizeMax)
  pageSize: number = PEOPLE_PAGE_LIMITS.pageSizeDefault;
}
