import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { AdminPermission, StaffRole } from '@viratec/contracts';

export class UpdateStaffAccessDto {
  @ApiProperty({ enum: [StaffRole.NONE, StaffRole.ADMIN] })
  @IsIn([StaffRole.NONE, StaffRole.ADMIN])
  staffRole!: StaffRole.NONE | StaffRole.ADMIN;

  @ApiProperty({ enum: AdminPermission, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsEnum(AdminPermission, { each: true })
  permissions!: AdminPermission[];

  @ApiPropertyOptional({ description: 'ISO date when the access expires automatically' })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string | null;
}

export class BlockUserDto {
  @ApiProperty()
  @IsBoolean()
  blocked!: boolean;
}

export class TransferOwnershipDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;
}

export class ListUsersQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Only administrators and the owner' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  staffOnly?: boolean;
}

export class AuditQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  action?: string;
}
