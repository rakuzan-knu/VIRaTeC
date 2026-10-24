import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { FacultyDivision } from '@viratec/contracts';
import { CursorQueryDto } from '../../common/dto/cursor-query.dto';

export class ListPapersQueryDto extends CursorQueryDto {
  @ApiPropertyOptional({ enum: FacultyDivision })
  @IsOptional()
  @IsEnum(FacultyDivision)
  faculty?: FacultyDivision;
}
