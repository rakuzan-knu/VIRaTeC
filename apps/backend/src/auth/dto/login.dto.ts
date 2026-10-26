import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { PROFILE_LIMITS } from '@viratec/contracts';

export class LoginDto {
  @ApiProperty({ example: 'researcher@knu.ua', description: 'User corporate or academic email' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Account password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(PROFILE_LIMITS.passwordMax)
  password!: string;
}
