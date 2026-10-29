import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token from the verification link' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  @Matches(/^[A-Za-z0-9_-]+$/)
  token!: string;
}
