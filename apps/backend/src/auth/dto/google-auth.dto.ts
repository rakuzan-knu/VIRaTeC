import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google Identity Services ID token (credential)' })
  @IsString()
  @IsNotEmpty()
  credential: string;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Acceptance of the Terms of Service and Privacy Policy, required for new accounts',
  })
  @IsOptional()
  @Equals(true)
  acceptTerms?: true;
}
