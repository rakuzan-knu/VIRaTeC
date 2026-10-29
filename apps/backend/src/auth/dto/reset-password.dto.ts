import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PROFILE_LIMITS } from '@viratec/contracts';

export class ResetPasswordDto {
  @ApiProperty({ example: 'student@knu.ua' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: '123456', description: 'Code from the password reset email' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;

  @ApiProperty({ example: 'NewSecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(PROFILE_LIMITS.passwordMin)
  @MaxLength(PROFILE_LIMITS.passwordMax)
  newPassword!: string;
}
