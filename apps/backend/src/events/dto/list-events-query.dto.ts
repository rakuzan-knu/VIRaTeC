import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { EVENT_LIST_SCOPES, EventType, type EventListScope } from '@viratec/contracts';
import { CursorQueryDto } from '../../common/dto/cursor-query.dto';

export class ListEventsQueryDto extends CursorQueryDto {
  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiPropertyOptional({ enum: EVENT_LIST_SCOPES })
  @IsOptional()
  @IsIn(EVENT_LIST_SCOPES)
  scope?: EventListScope;
}
