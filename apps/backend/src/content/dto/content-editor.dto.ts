import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsIn,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CONTENT_EDITOR_LIMITS,
  TRANSLATION_LIMITS,
  type ContentFields,
  type ContentLocaleKey,
} from '@viratec/contracts';

export const CONTENTFUL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;

const DATA_URL_OVERHEAD = 64;

export class SaveContentEntryDto {
  @ApiProperty({ description: 'Version of the entry the edit is based on' })
  @IsInt()
  @Min(1)
  version!: number;

  @ApiProperty({ description: 'All fields of the entry, keyed by field id and locale' })
  @IsObject()
  fields!: ContentFields;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class CreateContentEntryDto {
  @ApiProperty({ example: 'card' })
  @Matches(CONTENTFUL_ID_PATTERN)
  contentTypeId!: string;

  @ApiProperty()
  @IsObject()
  fields!: ContentFields;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class DeleteContentEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class UploadContentAssetDto {
  @ApiProperty({ example: 'team-photo.webp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fileName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Image as a base64 data URL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(Math.ceil(CONTENT_EDITOR_LIMITS.maxAssetBytes / 3) * 4 + DATA_URL_OVERHEAD)
  data!: string;
}

export class PublishContentDto {
  @ApiPropertyOptional({ description: 'Changes to publish; all pending changes when omitted' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(CONTENT_EDITOR_LIMITS.maxPublishBatch)
  @IsUUID('4', { each: true })
  changeIds?: string[];
}

const CONTENT_LOCALE_KEYS: readonly ContentLocaleKey[] = ['en', 'uk'];

export class TranslateContentDto {
  @ApiProperty({ enum: CONTENT_LOCALE_KEYS, example: 'uk' })
  @IsIn(CONTENT_LOCALE_KEYS)
  from!: ContentLocaleKey;

  @ApiProperty({ enum: CONTENT_LOCALE_KEYS, example: 'en' })
  @IsIn(CONTENT_LOCALE_KEYS)
  to!: ContentLocaleKey;

  @ApiProperty({ type: [String], example: ['Створюймо дослідження разом'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(TRANSLATION_LIMITS.maxTexts)
  @IsString({ each: true })
  @MaxLength(TRANSLATION_LIMITS.maxTextLength, { each: true })
  texts!: string[];
}

const REVISION_RESOURCE_TYPES = ['ENTRY', 'PROJECT', 'EVENT', 'PUBLICATION'] as const;

type RevisionResourceType = (typeof REVISION_RESOURCE_TYPES)[number];

export class ListContentRevisionsQueryDto {
  @ApiProperty({ enum: REVISION_RESOURCE_TYPES })
  @IsIn(REVISION_RESOURCE_TYPES)
  resourceType!: RevisionResourceType;

  @ApiProperty({ example: '4kXrJ2' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  resourceId!: string;
}

export class RestoreContentRevisionDto extends ListContentRevisionsQueryDto {
  @ApiProperty({
    description: 'Version id from the list; Contentful versions start with contentful:',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  revisionId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}
