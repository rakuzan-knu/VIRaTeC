import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Matches, MaxLength } from 'class-validator';
import { SavedItemKind } from '@viratec/contracts';

export const SAVED_REF_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,119}$/;

export class SavedItemDto {
  @ApiProperty({ enum: SavedItemKind })
  @IsEnum(SavedItemKind)
  kind: SavedItemKind;

  @ApiProperty({ example: 'first-intercontinental-coil-project' })
  @IsString()
  @MaxLength(120)
  @Matches(SAVED_REF_PATTERN)
  refId: string;
}
