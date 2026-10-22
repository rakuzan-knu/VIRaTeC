import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class TwoFactorCodeDto {
  @ApiProperty({ example: '123456', description: 'Authenticator code or a backup code' })
  @IsString()
  @Length(6, 20)
  @Matches(/^[A-Za-z0-9\s-]+$/)
  code: string;
}
