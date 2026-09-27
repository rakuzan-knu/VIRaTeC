import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Looking for NLP collaborators for Ukrainian Speech Corpus project' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Our laboratory at FIT is seeking partners from NNIF with expertise in phonetics...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: ['Collaboration', 'NLP', 'Phonetics', 'FIT', 'NNIF'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];
}
