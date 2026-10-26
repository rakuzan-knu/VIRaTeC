import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import { ProfileVisibility } from '@viratec/contracts';

export class UpdatePrivacyDto {
  @ApiProperty({ enum: ProfileVisibility })
  @IsEnum(ProfileVisibility)
  visibility!: ProfileVisibility;

  @ApiProperty({ description: 'Show the email address on the public profile' })
  @IsBoolean()
  showEmail!: boolean;
}
