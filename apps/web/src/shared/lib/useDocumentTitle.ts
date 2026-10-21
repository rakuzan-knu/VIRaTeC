import { useEffect } from 'react';

const SITE_NAME = 'VIRaTeC';
const DEFAULT_TITLE = 'VIRaTeC — Virtual Innovating Research & Technology Community (КНУ)';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  }, [title]);
}
