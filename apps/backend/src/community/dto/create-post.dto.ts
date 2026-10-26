import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { COMMUNITY_POST_LIMITS } from '@viratec/contracts';

export class CreatePostDto {
  @ApiProperty({ example: 'Looking for NLP collaborators for Ukrainian Speech Corpus project' })
  @IsString()
  @IsNotEmpty()
  @MinLength(COMMUNITY_POST_LIMITS.titleMin)
  @MaxLength(COMMUNITY_POST_LIMITS.titleMax)
  title!: string;

  @ApiProperty({
    example: 'Our laboratory at FIT is seeking partners from NNIF with expertise in phonetics...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(COMMUNITY_POST_LIMITS.contentMin)
  @MaxLength(COMMUNITY_POST_LIMITS.contentMax)
  content!: string;

  @ApiProperty({ example: ['Collaboration', 'NLP', 'Phonetics', 'FIT', 'NNIF'], required: false })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(COMMUNITY_POST_LIMITS.tagMax, { each: true })
  @ArrayMaxSize(COMMUNITY_POST_LIMITS.tagsMax)
  @IsOptional()
  tags?: string[] = [];
}
