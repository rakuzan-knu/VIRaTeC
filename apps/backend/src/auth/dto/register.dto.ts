import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole, FacultyDivision } from '@viratec/contracts';

export class RegisterDto {
  @ApiProperty({ example: 'student@knu.ua', description: 'Academic email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Strong password' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Олександр Шевченко', description: 'Full Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: [UserRole.STUDENT, UserRole.PARTNER], default: UserRole.STUDENT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.STUDENT;

  @ApiProperty({ enum: FacultyDivision, default: FacultyDivision.FIT })
  @IsEnum(FacultyDivision)
  @IsOptional()
  faculty?: FacultyDivision = FacultyDivision.FIT;

  @ApiProperty({ example: 'Кафедра технологій штучного інтелекту', required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: true,
    description: 'Acceptance of the Terms of Service and Privacy Policy',
  })
  @Equals(true)
  acceptTerms: true;
}
