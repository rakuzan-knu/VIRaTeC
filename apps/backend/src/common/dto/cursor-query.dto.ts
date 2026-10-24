import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { LIST_PAGE_LIMITS } from '@viratec/contracts';

export class CursorQueryDto {
  @ApiPropertyOptional({ default: LIST_PAGE_LIMITS.default, maximum: LIST_PAGE_LIMITS.max })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(LIST_PAGE_LIMITS.max)
  limit: number = LIST_PAGE_LIMITS.default;

  @ApiPropertyOptional({ description: 'The nextCursor value from the previous page' })
  @IsOptional()
  @IsUUID()
  cursor?: string;
}
