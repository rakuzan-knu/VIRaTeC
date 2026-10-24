import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CursorQueryDto } from '../../common/dto/cursor-query.dto';

export class ListProjectsQueryDto extends CursorQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  tag?: string;
}
