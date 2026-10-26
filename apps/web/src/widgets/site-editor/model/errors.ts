import { ApiError, NETWORK_ERROR_STATUS } from '@/shared/api/apiClient';
import { useCommonMessages } from '@/shared/i18n';
import { useSiteEditorMessages } from './messages';

export const isConflict = (error: unknown) => error instanceof ApiError && error.status === 409;

export function useEditorErrorMessage(error: unknown) {
  const t = useSiteEditorMessages();
  const common = useCommonMessages();
  if (!error) return null;
  if (!(error instanceof ApiError)) return t.loadFailed;
  if (error.status === NETWORK_ERROR_STATUS) return common.networkError;
  if (error.status === 409) return t.inspector.conflict;
  return error.message || t.loadFailed;
}
