import { useMutation } from '@tanstack/react-query';
import { getApiErrorCode } from '@/shared/api/apiClient';
import type { Locale } from '@/shared/i18n';
import { translateTexts } from '../api/editorApi';
import { useSiteEditorMessages } from './messages';

export function useTranslateText() {
  const t = useSiteEditorMessages();
  const mutation = useMutation({ mutationFn: translateTexts });
  const code = mutation.error ? getApiErrorCode(mutation.error) : null;
  const error = !mutation.error
    ? null
    : code === 'TRANSLATION_NOT_CONFIGURED'
      ? t.translation.notConfigured
      : code === 'TRANSLATION_REFUSED'
        ? t.translation.refused
        : t.translation.failed;

  const translate = (from: Locale, to: Locale, text: string) =>
    mutation
      .mutateAsync({ from, to, texts: [text] })
      .then((result) => result.translations[0] ?? null)
      .catch(() => null);

  return { translate, isPending: mutation.isPending, error };
}
