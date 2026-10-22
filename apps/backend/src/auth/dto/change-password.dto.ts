import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { PROFILE_LIMITS } from '@viratec/contracts';

export class ChangePasswordDto {
  @ApiProperty({ required: false, description: 'Required when the account already has a password' })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({ example: 'NewSecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(PROFILE_LIMITS.passwordMin)
  newPassword: string;
}
