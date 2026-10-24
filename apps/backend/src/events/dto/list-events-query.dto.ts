import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EventType } from '@viratec/contracts';
import { CursorQueryDto } from '../../common/dto/cursor-query.dto';

export class ListEventsQueryDto extends CursorQueryDto {
  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;
}
