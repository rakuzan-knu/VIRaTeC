import { useRef } from 'react';
import { useGoogleButton } from '@/shared/lib/googleIdentity';

interface GoogleReauthProps {
  label: string;
  confirmedLabel: string;
  unavailableLabel: string;
  isConfirmed: boolean;
  onCredential: (credential: string) => void;
}

export function GoogleReauth({
  label,
  confirmedLabel,
  unavailableLabel,
  isConfirmed,
  onCredential,
}: GoogleReauthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isConfigured, loadFailed } = useGoogleButton(containerRef, {
    text: 'continue_with',
    onCredential,
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label font-medium text-text-muted">{label}</span>
      {isConfigured && !loadFailed ? (
        <div ref={containerRef} className="flex min-h-10 w-full max-w-[320px]" />
      ) : (
        <p className="text-sm text-viratec-subtle">{unavailableLabel}</p>
      )}
      <p role="status" className="text-sm text-viratec-accent empty:hidden">
        {isConfirmed ? confirmedLabel : ''}
      </p>
    </div>
  );
}
