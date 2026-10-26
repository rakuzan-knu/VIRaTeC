import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PROFILE_LIMITS } from '@viratec/contracts';

export class ChangePasswordDto {
  @ApiProperty({ required: false, description: 'Required when the account already has a password' })
  @IsOptional()
  @IsString()
  @MaxLength(PROFILE_LIMITS.passwordMax)
  currentPassword?: string;

  @ApiProperty({ example: 'NewSecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(PROFILE_LIMITS.passwordMin)
  @MaxLength(PROFILE_LIMITS.passwordMax)
  newPassword!: string;
}
