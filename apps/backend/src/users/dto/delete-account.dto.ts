import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PROFILE_LIMITS } from '@viratec/contracts';

const EMAIL_MAX = 320;
const GOOGLE_CREDENTIAL_MAX = 4096;

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

  @ApiProperty({ required: false, description: 'Required when two-factor is enabled' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  code?: string;

  @ApiProperty({ required: false, description: 'Required for accounts without a password' })
  @IsOptional()
  @IsString()
  @MaxLength(GOOGLE_CREDENTIAL_MAX)
  googleCredential?: string;
}
