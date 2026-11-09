import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AcceptTermsDto {
  @ApiProperty({ example: '1.1', description: 'Version of the terms shown to the user' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  version!: string;
}
