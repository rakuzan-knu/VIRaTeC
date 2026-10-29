import { useMutation } from '@tanstack/react-query';
import { getApiErrorCode } from '@/shared/api/apiClient';
import type { Locale } from '@/shared/i18n';
import { translateTexts } from '../api/editorApi';
import { useSiteEditorMessages, type SiteEditorMessages } from './messages';

export const translationErrorMessage = (error: unknown, t: SiteEditorMessages) => {
  if (!error) return null;
  const code = getApiErrorCode(error);
  if (code === 'TRANSLATION_NOT_CONFIGURED') return t.translation.notConfigured;
  if (code === 'TRANSLATION_REFUSED') return t.translation.refused;
  return t.translation.failed;
};

export function useTranslateText() {
  const t = useSiteEditorMessages();
  const mutation = useMutation({ mutationFn: translateTexts });

  const translate = (from: Locale, to: Locale, text: string) =>
    mutation
      .mutateAsync({ from, to, texts: [text] })
      .then((result) => result.translations[0] ?? null)
      .catch(() => null);

  return {
    translate,
    isPending: mutation.isPending,
    error: translationErrorMessage(mutation.error, t),
  };
}
