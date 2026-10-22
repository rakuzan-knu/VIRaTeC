import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  FacultyDivision,
  OpenToOption,
  PROFILE_DETAIL_LIMITS,
  PROFILE_LIMITS,
  StudyLevel,
} from '@viratec/contracts';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpdateProfileDto {
  @ApiProperty({ example: 'Олександр Шевченко', required: false })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(PROFILE_LIMITS.nameMin)
  @MaxLength(PROFILE_LIMITS.nameMax)
  name?: string;

  @ApiProperty({ enum: FacultyDivision, required: false })
  @IsOptional()
  @IsEnum(FacultyDivision)
  faculty?: FacultyDivision;

  @ApiProperty({ example: 'Кафедра технологій штучного інтелекту', required: false })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(PROFILE_LIMITS.departmentMax)
  department?: string;

  @ApiProperty({ example: 'PhD student researching trustworthy AI.', required: false })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(PROFILE_LIMITS.bioMax)
  bio?: string;

  @ApiProperty({ example: ['Machine learning', 'COIL'], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(PROFILE_LIMITS.skillsMax)
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((item) => (typeof item === 'string' ? item.trim() : item))
      : value,
  )
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(PROFILE_LIMITS.skillMax, { each: true })
  skills?: string[];

  @ApiProperty({ enum: StudyLevel, required: false, nullable: true })
  @IsOptional()
  @IsEnum(StudyLevel)
  studyLevel?: StudyLevel | null;

  @ApiProperty({ example: 2, required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(PROFILE_DETAIL_LIMITS.studyYearMin)
  @Max(PROFILE_DETAIL_LIMITS.studyYearMax)
  studyYear?: number | null;

  @ApiProperty({ example: 'Taras Shevchenko National University of Kyiv', required: false })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(PROFILE_DETAIL_LIMITS.institutionMax)
  institution?: string;

  @ApiProperty({
    example: 'UA',
    description: 'ISO 3166-1 alpha-2',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @Matches(/^[A-Z]{2}$/)
  country?: string | null;

  @ApiProperty({ example: [{ code: 'uk', level: 'NATIVE' }], required: false })
  @IsOptional()
  @IsArray()
  languages?: unknown[];

  @ApiProperty({ example: { orcid: '0000-0002-1825-0097', github: 'octocat' }, required: false })
  @IsOptional()
  @IsObject()
  links?: Record<string, unknown>;

  @ApiProperty({ enum: OpenToOption, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(Object.keys(OpenToOption).length)
  @IsEnum(OpenToOption, { each: true })
  openTo?: OpenToOption[];
}
