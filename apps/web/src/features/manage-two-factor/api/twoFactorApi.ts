import { api } from '@/shared/api/apiClient';
import type {
  BackupCodesResponseDto,
  StepUpResponseDto,
  TwoFactorSetupResponseDto,
} from '@viratec/contracts';

export const beginTwoFactorSetup = (): Promise<TwoFactorSetupResponseDto> =>
  api.post<TwoFactorSetupResponseDto>('/auth/2fa/setup', undefined);

export const enableTwoFactor = (code: string): Promise<BackupCodesResponseDto> =>
  api.post<BackupCodesResponseDto>('/auth/2fa/enable', { code });

export const disableTwoFactor = (code: string): Promise<{ success: boolean }> =>
  api.post<{ success: boolean }>('/auth/2fa/disable', { code });

export const regenerateBackupCodes = (code: string): Promise<BackupCodesResponseDto> =>
  api.post<BackupCodesResponseDto>('/auth/2fa/backup-codes', { code });

export const stepUp = (code: string): Promise<StepUpResponseDto> =>
  api.post<StepUpResponseDto>('/auth/step-up', { code });
