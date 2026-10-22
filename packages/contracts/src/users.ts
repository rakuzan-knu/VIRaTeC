import { z } from 'zod';
import {
  AdminPermission,
  FacultyDivision,
  OpenToOption,
  ProfileVisibility,
  StaffRole,
  StudyLevel,
  UserRole,
} from './enums.js';
import {
  CountryCodeSchema,
  PROFILE_DETAIL_LIMITS,
  ProfileLanguageSchema,
  ProfileLanguagesSchema,
  ProfileLinksSchema,
} from './profile.js';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole),
  faculty: z.nativeEnum(FacultyDivision),
  department: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  skills: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDto = z.infer<typeof UserSchema>;

export const AccountSchema = UserSchema.extend({
  studyLevel: z.nativeEnum(StudyLevel).nullable(),
  studyYear: z.number().int().nullable(),
  institution: z.string().nullable(),
  country: z.string().nullable(),
  languages: z.array(ProfileLanguageSchema),
  links: z.record(z.string()),
  openTo: z.array(z.nativeEnum(OpenToOption)),
  visibility: z.nativeEnum(ProfileVisibility),
  showEmail: z.boolean(),
  hasPassword: z.boolean(),
  hasGoogle: z.boolean(),
  twoFactorEnabled: z.boolean(),
  staffRole: z.nativeEnum(StaffRole),
  permissions: z.array(z.nativeEnum(AdminPermission)),
  staffExpiresAt: z.date().nullable(),
});

export type AccountDto = z.infer<typeof AccountSchema>;

export const PROFILE_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  departmentMax: 120,
  bioMax: 500,
  skillMax: 32,
  skillsMax: 12,
  passwordMin: 8,
} as const;

export const UpdateProfileRequestSchema = z.object({
  name: z.string().trim().min(PROFILE_LIMITS.nameMin).max(PROFILE_LIMITS.nameMax).optional(),
  faculty: z.nativeEnum(FacultyDivision).optional(),
  department: z.string().trim().max(PROFILE_LIMITS.departmentMax).optional(),
  bio: z.string().trim().max(PROFILE_LIMITS.bioMax).optional(),
  skills: z
    .array(z.string().trim().min(1).max(PROFILE_LIMITS.skillMax))
    .max(PROFILE_LIMITS.skillsMax)
    .optional(),
  studyLevel: z.nativeEnum(StudyLevel).nullable().optional(),
  studyYear: z
    .number()
    .int()
    .min(PROFILE_DETAIL_LIMITS.studyYearMin)
    .max(PROFILE_DETAIL_LIMITS.studyYearMax)
    .nullable()
    .optional(),
  institution: z.string().trim().max(PROFILE_DETAIL_LIMITS.institutionMax).optional(),
  country: CountryCodeSchema.nullable().optional(),
  languages: ProfileLanguagesSchema.optional(),
  links: ProfileLinksSchema.optional(),
  openTo: z.array(z.nativeEnum(OpenToOption)).optional(),
});

export type UpdateProfileRequestDto = z.infer<typeof UpdateProfileRequestSchema>;

export const AVATAR_LIMITS = {
  maxBytes: 512 * 1024,
  size: 256,
  mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  sourceMaxBytes: 10 * 1024 * 1024,
} as const;

export type AvatarMimeType = (typeof AVATAR_LIMITS.mimeTypes)[number];

export const UploadAvatarRequestSchema = z.object({
  image: z.string().startsWith('data:image/'),
});

export type UploadAvatarRequestDto = z.infer<typeof UploadAvatarRequestSchema>;

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(PROFILE_LIMITS.passwordMin),
});

export type ChangePasswordRequestDto = z.infer<typeof ChangePasswordRequestSchema>;

export const DeleteAccountRequestSchema = z.object({
  confirmation: z.string().min(1),
  password: z.string().optional(),
});

export type DeleteAccountRequestDto = z.infer<typeof DeleteAccountRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export const GoogleAuthRequestSchema = z.object({
  credential: z.string().min(1),
});

export type GoogleAuthRequestDto = z.infer<typeof GoogleAuthRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
  faculty: z.nativeEnum(FacultyDivision).default(FacultyDivision.FIT),
  department: z.string().optional(),
});

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

export const AuthResponseSchema = z.object({
  user: AccountSchema,
});

export type AuthResponseDto = z.infer<typeof AuthResponseSchema>;

export const MfaRequiredResponseSchema = z.object({
  mfaRequired: z.literal(true),
});

export type MfaRequiredResponseDto = z.infer<typeof MfaRequiredResponseSchema>;

export type SignInResponseDto = AuthResponseDto | MfaRequiredResponseDto;

export const isMfaRequired = (response: SignInResponseDto): response is MfaRequiredResponseDto =>
  'mfaRequired' in response;

export const TWO_FACTOR_CODE_LENGTH = 6;
export const BACKUP_CODE_COUNT = 10;

export const TwoFactorCodeRequestSchema = z.object({
  code: z.string().trim().min(6).max(20),
});

export type TwoFactorCodeRequestDto = z.infer<typeof TwoFactorCodeRequestSchema>;

export const TwoFactorSetupResponseSchema = z.object({
  otpauthUrl: z.string(),
  qrCodeSvg: z.string(),
  manualKey: z.string(),
});

export type TwoFactorSetupResponseDto = z.infer<typeof TwoFactorSetupResponseSchema>;

export const BackupCodesResponseSchema = z.object({
  backupCodes: z.array(z.string()),
});

export type BackupCodesResponseDto = z.infer<typeof BackupCodesResponseSchema>;

export const StepUpResponseSchema = z.object({
  elevatedUntil: z.string(),
});

export type StepUpResponseDto = z.infer<typeof StepUpResponseSchema>;
