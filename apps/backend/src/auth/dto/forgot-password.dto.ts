import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'student@knu.ua' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(320)
  email!: string;
}
