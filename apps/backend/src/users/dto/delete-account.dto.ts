import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PROFILE_LIMITS } from '@viratec/contracts';

const EMAIL_MAX = 320;

export class DeleteAccountDto {
  @ApiProperty({ example: 'student@knu.ua', description: 'Account email typed to confirm' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(EMAIL_MAX)
  confirmation!: string;

  @ApiProperty({ required: false, description: 'Required for accounts with a password' })
  @IsOptional()
  @IsString()
  @MaxLength(PROFILE_LIMITS.passwordMax)
  password?: string;
}
