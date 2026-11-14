import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { ENV } from '../config/env';
import { useLocale } from '../i18n';

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

export function loadGoogleIdentity(locale: string): Promise<GoogleAccountsId> {
  if (window.google?.accounts.id) return Promise.resolve(window.google.accounts.id);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<GoogleAccountsId>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${GSI_SCRIPT_SRC}?hl=${encodeURIComponent(locale)}`;
    script.async = true;
    script.defer = true;
    const timeout = window.setTimeout(() => fail('Google Identity Services timed out'), 15_000);
    const fail = (message: string) => {
      window.clearTimeout(timeout);
      scriptPromise = null;
      script.remove();
      reject(new Error(message));
    };
    script.onload = () => {
      window.clearTimeout(timeout);
      if (window.google?.accounts.id) resolve(window.google.accounts.id);
      else fail('Google Identity Services failed to initialize');
    };
    script.onerror = () => fail('Failed to load Google Identity Services');
    document.head.appendChild(script);
  });

  return scriptPromise;
}

const GOOGLE_BUTTON_MAX_WIDTH = 400;
const GOOGLE_BUTTON_WIDTH_STEP = 4;

type CredentialHandler = (credential: string) => void;

const credentialHandlers = new Map<HTMLElement, CredentialHandler>();
const initializedClients = new WeakSet<GoogleAccountsId>();
let activeContainer: HTMLElement | null = null;
let isTrackingFocus = false;

const findContainer = (element: Element | null) => {
  if (!element) return null;
  for (const container of credentialHandlers.keys()) {
    if (container.contains(element)) return container;
  }
  return null;
};

const trackActiveButton = () => {
  if (isTrackingFocus) return;
  isTrackingFocus = true;
  window.addEventListener('blur', () => {
    activeContainer = findContainer(document.activeElement) ?? activeContainer;
  });
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.target instanceof Element) {
        activeContainer = findContainer(event.target) ?? activeContainer;
      }
    },
    true,
  );
};

const dispatchCredential = ({ credential }: GoogleCredentialResponse) => {
  const handler =
    (activeContainer && credentialHandlers.get(activeContainer)) ??
    (credentialHandlers.size === 1 ? credentialHandlers.values().next().value : undefined);
  handler?.(credential);
};

const initializeOnce = (googleId: GoogleAccountsId, text: GoogleButtonText) => {
  if (initializedClients.has(googleId)) return;
  initializedClients.add(googleId);
  googleId.initialize({
    client_id: ENV.GOOGLE_CLIENT_ID,
    callback: dispatchCredential,
    ux_mode: 'popup',
    context: text === 'signup_with' ? 'signup' : text === 'continue_with' ? 'use' : 'signin',
  });
};

interface GoogleButtonOptions {
  text: GoogleButtonText;
  onCredential: (credential: string) => void;
  disabled?: boolean;
}

export function useGoogleButton(
  containerRef: RefObject<HTMLDivElement | null>,
  { text, onCredential, disabled = false }: GoogleButtonOptions,
) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const onCredentialRef = useRef(onCredential);
  const disabledRef = useRef(disabled);
  const locale = useLocale();

  useEffect(() => {
    onCredentialRef.current = onCredential;
    disabledRef.current = disabled;
  }, [onCredential, disabled]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!ENV.GOOGLE_CLIENT_ID || !container) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    let frame = 0;
    setLoadFailed(false);
    setIsLoading(true);

    loadGoogleIdentity(locale)
      .then((googleId) => {
        if (cancelled) return;
        initializeOnce(googleId, text);
        trackActiveButton();
        credentialHandlers.set(container, (credential) => {
          if (!disabledRef.current) onCredentialRef.current(credential);
        });
        let previousWidth = -1;
        const render = () => {
          frame = 0;
          const width = Math.floor(Math.min(container.clientWidth, GOOGLE_BUTTON_MAX_WIDTH));
          if (width <= 0 || Math.abs(width - previousWidth) < GOOGLE_BUTTON_WIDTH_STEP) return;
          previousWidth = width;
          container.replaceChildren();
          googleId.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            logo_alignment: 'center',
            text,
            width,
            locale,
          });
        };
        render();
        resizeObserver = new ResizeObserver(() => {
          if (!frame) frame = window.requestAnimationFrame(render);
        });
        resizeObserver.observe(container);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      credentialHandlers.delete(container);
      if (activeContainer === container) activeContainer = null;
    };
  }, [containerRef, text, locale, attempt]);

  return { isConfigured: Boolean(ENV.GOOGLE_CLIENT_ID), loadFailed, isLoading, retry };
}
