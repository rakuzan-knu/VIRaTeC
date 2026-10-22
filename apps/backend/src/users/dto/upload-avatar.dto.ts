import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AVATAR_LIMITS } from '@viratec/contracts';

const DATA_URL_OVERHEAD = 64;

export class UploadAvatarDto {
  @ApiProperty({
    example: 'data:image/webp;base64,UklGR...',
    description: `PNG, JPEG or WebP image as a base64 data URL, up to ${AVATAR_LIMITS.maxBytes} bytes`,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(Math.ceil(AVATAR_LIMITS.maxBytes / 3) * 4 + DATA_URL_OVERHEAD)
  image: string;
}
