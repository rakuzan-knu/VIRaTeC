import { getApiErrorCode } from '@/shared/api/apiClient';

export type EditorGateCode = 'MFA_REVERIFY_REQUIRED' | 'MFA_SETUP_REQUIRED' | 'NO_ACCESS';

export const gateFor = (error: unknown): EditorGateCode | null => {
  const code = getApiErrorCode(error);
  if (code === 'MFA_REVERIFY_REQUIRED' || code === 'MFA_SETUP_REQUIRED') return code;
  if (code === 'ADMIN_ACCESS_REQUIRED' || code === 'PERMISSION_DENIED') return 'NO_ACCESS';
  return null;
};
