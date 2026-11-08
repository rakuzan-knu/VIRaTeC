import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsTimeZone, MaxLength } from 'class-validator';
import { CONTENT_LOCALE_KEYS, type ContentLocaleKey } from '@viratec/contracts';

const UNSUBSCRIBE_TOKEN_MAX = 200;

export class EventRegistrationDto {
  @ApiProperty({ enum: CONTENT_LOCALE_KEYS })
  @IsIn(CONTENT_LOCALE_KEYS)
  locale!: ContentLocaleKey;

  @ApiProperty({ example: 'Europe/Kyiv' })
  @IsTimeZone()
  timeZone!: string;
}

export class EventUnsubscribeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(UNSUBSCRIBE_TOKEN_MAX)
  token!: string;
}
