import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import type { RecordData } from '@viratec/contracts';

export class SaveRecordDto {
  @ApiProperty({ description: 'Editable data of the record' })
  @IsObject()
  data: RecordData;

  @ApiPropertyOptional({ description: 'updatedAt of the published record the edit is based on' })
  @IsOptional()
  @IsISO8601()
  baseUpdatedAt: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class CreateRecordDto {
  @ApiProperty()
  @IsObject()
  data: RecordData;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class DeleteRecordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}
