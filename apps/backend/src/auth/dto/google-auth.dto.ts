import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const GOOGLE_CREDENTIAL_MAX = 4096;

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google Identity Services ID token (credential)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(GOOGLE_CREDENTIAL_MAX)
  credential!: string;

  @ApiProperty({
    required: false,
    example: true,
    description: 'Acceptance of the Terms of Service and Privacy Policy, required for new accounts',
  })
  @IsOptional()
  @Equals(true)
  acceptTerms?: true;
}
