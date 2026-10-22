import { useEffect, useRef, useState, type RefObject } from 'react';
import { ENV } from '../config/env';
import { INTL_LOCALE, useLocale } from '../i18n';

const GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  ux_mode?: 'popup' | 'redirect';
  context?: 'signin' | 'signup' | 'use';
}

interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: GoogleButtonText;
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let scriptPromise: Promise<GoogleAccountsId> | null = null;

export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (window.google?.accounts.id) return Promise.resolve(window.google.accounts.id);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts.id) resolve(window.google.accounts.id);
      else reject(new Error('Google Identity Services failed to initialize'));
    };
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error('Failed to load Google Identity Services'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

const GOOGLE_BUTTON_MAX_WIDTH = 400;

interface GoogleButtonOptions {
  text: GoogleButtonText;
  onCredential: (credential: string) => void;
}

export function useGoogleButton(
  containerRef: RefObject<HTMLDivElement | null>,
  { text, onCredential }: GoogleButtonOptions,
) {
  const [loadFailed, setLoadFailed] = useState(false);
  const onCredentialRef = useRef(onCredential);
  const locale = useLocale();

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    const container = containerRef.current;
    if (!ENV.GOOGLE_CLIENT_ID || !container) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((googleId) => {
        if (cancelled) return;
        googleId.initialize({
          client_id: ENV.GOOGLE_CLIENT_ID,
          callback: ({ credential }) => onCredentialRef.current(credential),
          ux_mode: 'popup',
          context: text === 'signup_with' ? 'signup' : text === 'continue_with' ? 'use' : 'signin',
        });
        container.replaceChildren();
        googleId.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          logo_alignment: 'center',
          text,
          width: Math.min(container.clientWidth, GOOGLE_BUTTON_MAX_WIDTH),
          locale: INTL_LOCALE[locale],
        });
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [containerRef, text, locale]);

  return { isConfigured: Boolean(ENV.GOOGLE_CLIENT_ID), loadFailed };
}
