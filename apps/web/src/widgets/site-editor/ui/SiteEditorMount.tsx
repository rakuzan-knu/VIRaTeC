import { lazy, Suspense, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';
import { useContentPreviewStore } from '@/shared/lib';
import { SITE_EDITOR_PARAM } from '@/shared/config/routes';
import { useCanOpenSiteEditor } from '../model/permissions';
import { isEditorFrame } from '../model/useFrameSync';
import { FrameBridge } from './FrameBridge';

const SiteEditor = lazy(() =>
  import('./SiteEditor').then((module) => ({ default: module.SiteEditor })),
);

export function SiteEditorMount() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const isEnabled = useContentPreviewStore((state) => state.enabled);
  const setEnabled = useContentPreviewStore((state) => state.setEnabled);
  const isRestoring = useSessionStore((state) => state.isRestoring);
  const canOpen = useCanOpenSiteEditor();

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (!params.has(SITE_EDITOR_PARAM) || isRestoring) return;
    params.delete(SITE_EDITOR_PARAM);
    if (canOpen) setEnabled(true);
    const query = params.toString();
    navigate({ pathname, search: query ? `?${query}` : '', hash }, { replace: true });
  }, [search, pathname, hash, isRestoring, canOpen, setEnabled, navigate]);

  useEffect(() => {
    if (isEnabled && !isRestoring && !canOpen) setEnabled(false);
  }, [isEnabled, isRestoring, canOpen, setEnabled]);

  if (!isEnabled || !canOpen) return null;
  if (isEditorFrame()) return <FrameBridge />;
  return (
    <Suspense fallback={null}>
      <SiteEditor />
    </Suspense>
  );
}
