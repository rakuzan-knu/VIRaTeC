import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'student@knu.ua', description: 'Account email typed to confirm' })
  @IsString()
  @IsNotEmpty()
  confirmation: string;

  @ApiProperty({ required: false, description: 'Required for accounts with a password' })
  @IsOptional()
  @IsString()
  password?: string;
}
