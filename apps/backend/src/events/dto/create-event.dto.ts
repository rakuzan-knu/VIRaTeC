import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { EventType, FacultyDivision } from '@viratec/contracts';

const EVENT_LIMITS = {
  titleMax: 200,
  descriptionMax: 10_000,
  locationMax: 200,
  urlMax: 2048,
} as const;

export class CreateEventDto {
  @ApiProperty({ example: 'KNU AI & Linguistic Hackathon 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(EVENT_LIMITS.titleMax)
  title!: string;

  @ApiProperty({
    example: '48-hour interfaculty hackathon bringing together programmers and linguists.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(EVENT_LIMITS.descriptionMax)
  description!: string;

  @ApiProperty({ enum: EventType, default: EventType.HACKATHON })
  @IsEnum(EventType)
  type!: EventType;

  @ApiProperty({ enum: FacultyDivision, default: FacultyDivision.FIT })
  @IsEnum(FacultyDivision)
  faculty!: FacultyDivision;

  @ApiProperty({ example: 'ФІТ КНУ, вул. Богдана Гаврилишина, 24' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(EVENT_LIMITS.locationMax)
  location!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isOnline?: boolean = false;

  @ApiProperty({ example: '2026-10-15T09:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-10-17T18:00:00Z' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: 120, required: false })
  @IsInt()
  @IsPositive()
  @IsOptional()
  capacity?: number;

  @ApiProperty({ example: 'https://forms.gle/hackathon2026', required: false })
  @IsUrl()
  @MaxLength(EVENT_LIMITS.urlMax)
  @IsOptional()
  registrationLink?: string;
}
