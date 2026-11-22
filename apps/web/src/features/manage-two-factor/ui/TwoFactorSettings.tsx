import { useState } from 'react';
import { ShieldCheck, ShieldOff, Smartphone } from 'lucide-react';
import { StaffRole, type AccountDto } from '@viratec/contracts';
import { defineMessages, useLocalized } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import {
  useBeginTwoFactorSetup,
  useDisableTwoFactor,
  useEnableTwoFactor,
  useRegenerateBackupCodes,
} from '../model/useTwoFactor';
import { BackupCodesPanel } from './BackupCodesPanel';
import { CodePrompt, useCodeErrorMessage } from './CodePrompt';

const MESSAGES = defineMessages({
  en: {
    statusOn: 'Two-step verification is on',
    statusOff: 'Two-step verification is off',
    descriptionOff:
      'Protect your account with a one-time code from Google Authenticator in addition to your password.',
    descriptionOn: 'Signing in requires a code from your authenticator app or a backup code.',
    enable: 'Turn on two-step verification',
    step1: '1. Install Google Authenticator, Microsoft Authenticator or 1Password on your phone.',
    step2: '2. Scan this QR code in the app.',
    manual: 'Can’t scan? Enter this key manually:',
    step3: '3. Enter the 6-digit code the app shows.',
    qrAlt: 'QR code for your authenticator app',
    confirm: 'Confirm and turn on',
    regenerate: 'Generate new backup codes',
    regenerateHint: 'Old backup codes stop working immediately.',
    disable: 'Turn off',
    disableConfirm: 'Turn off two-step verification',
    staffRequired: 'Administrators must keep two-step verification on.',
    cancel: 'Cancel',
  },
  uk: {
    statusOn: 'Двоетапну перевірку ввімкнено',
    statusOff: 'Двоетапну перевірку вимкнено',
    descriptionOff:
      'Захистіть обліковий запис одноразовим кодом із Google Authenticator на додачу до пароля.',
    descriptionOn: 'Для входу потрібен код із застосунку-автентифікатора або резервний код.',
    enable: 'Увімкнути двоетапну перевірку',
    step1: '1. Встановіть на телефон Google Authenticator, Microsoft Authenticator або 1Password.',
    step2: '2. Відскануйте цей QR-код у застосунку.',
    manual: 'Не вдається відсканувати? Введіть цей ключ вручну:',
    step3: '3. Введіть 6-значний код, який показує застосунок.',
    qrAlt: 'QR-код для застосунку-автентифікатора',
    confirm: 'Підтвердити та ввімкнути',
    regenerate: 'Створити нові резервні коди',
    regenerateHint: 'Старі резервні коди одразу перестануть працювати.',
    disable: 'Вимкнути',
    disableConfirm: 'Вимкнути двоетапну перевірку',
    staffRequired: 'Адміністратори мають тримати двоетапну перевірку ввімкненою.',
    cancel: 'Скасувати',
  },
  de: {
    statusOn: 'Zwei-Faktor-Verifizierung ist aktiviert',
    statusOff: 'Zwei-Faktor-Verifizierung ist deaktiviert',
    descriptionOff:
      'Schützen Sie Ihr Konto zusätzlich zum Passwort mit einem Einmalcode aus Google Authenticator.',
    descriptionOn:
      'Für die Anmeldung ist ein Code aus Ihrer Authenticator-App oder ein Backup-Code erforderlich.',
    enable: 'Zwei-Faktor-Verifizierung aktivieren',
    step1:
      '1. Installieren Sie Google Authenticator, Microsoft Authenticator oder 1Password auf Ihrem Smartphone.',
    step2: '2. Scannen Sie diesen QR-Code in der App.',
    manual: 'Scannen nicht möglich? Geben Sie diesen Schlüssel manuell ein:',
    step3: '3. Geben Sie den 6-stelligen Code ein, den die App anzeigt.',
    qrAlt: 'QR-Code für Ihre Authenticator-App',
    confirm: 'Bestätigen und aktivieren',
    regenerate: 'Neue Backup-Codes erzeugen',
    regenerateHint: 'Alte Backup-Codes funktionieren sofort nicht mehr.',
    disable: 'Deaktivieren',
    disableConfirm: 'Zwei-Faktor-Verifizierung deaktivieren',
    staffRequired: 'Administratoren müssen die Zwei-Faktor-Verifizierung aktiviert lassen.',
    cancel: 'Abbrechen',
  },
  fr: {
    statusOn: 'La validation en deux étapes est activée',
    statusOff: 'La validation en deux étapes est désactivée',
    descriptionOff:
      'Protégez votre compte avec un code à usage unique de Google Authenticator en plus de votre mot de passe.',
    descriptionOn:
      'La connexion nécessite un code de votre application d’authentification ou un code de secours.',
    enable: 'Activer la validation en deux étapes',
    step1:
      '1. Installez Google Authenticator, Microsoft Authenticator ou 1Password sur votre téléphone.',
    step2: '2. Scannez ce QR code dans l’application.',
    manual: 'Impossible de scanner ? Saisissez cette clé manuellement :',
    step3: '3. Saisissez le code à 6 chiffres affiché par l’application.',
    qrAlt: 'QR code pour votre application d’authentification',
    confirm: 'Confirmer et activer',
    regenerate: 'Générer de nouveaux codes de secours',
    regenerateHint: 'Les anciens codes de secours cessent immédiatement de fonctionner.',
    disable: 'Désactiver',
    disableConfirm: 'Désactiver la validation en deux étapes',
    staffRequired: 'Les administrateurs doivent garder la validation en deux étapes activée.',
    cancel: 'Annuler',
  },
  ar: {
    statusOn: 'التحقق بخطوتين مفعّل',
    statusOff: 'التحقق بخطوتين غير مفعّل',
    descriptionOff: 'احمِ حسابك برمز لمرة واحدة من Google Authenticator إضافةً إلى كلمة المرور.',
    descriptionOn: 'يتطلب تسجيل الدخول رمزًا من تطبيق المصادقة أو رمزًا احتياطيًا.',
    enable: 'تفعيل التحقق بخطوتين',
    step1: '1. ثبّت Google Authenticator أو Microsoft Authenticator أو 1Password على هاتفك.',
    step2: '2. امسح رمز QR هذا في التطبيق.',
    manual: 'لا يمكنك المسح؟ أدخل هذا المفتاح يدويًا:',
    step3: '3. أدخل الرمز المكوّن من 6 أرقام الذي يعرضه التطبيق.',
    qrAlt: 'رمز QR لتطبيق المصادقة',
    confirm: 'تأكيد وتفعيل',
    regenerate: 'إنشاء رموز احتياطية جديدة',
    regenerateHint: 'تتوقف الرموز الاحتياطية القديمة عن العمل فورًا.',
    disable: 'إيقاف',
    disableConfirm: 'إيقاف التحقق بخطوتين',
    staffRequired: 'يجب على المسؤولين إبقاء التحقق بخطوتين مفعّلًا.',
    cancel: 'إلغاء',
  },
});

type Mode = 'idle' | 'setup' | 'regenerate' | 'disable';

interface TwoFactorSettingsProps {
  account: AccountDto;
}

export function TwoFactorSettings({ account }: TwoFactorSettingsProps) {
  const t = useLocalized(MESSAGES);
  const [mode, setMode] = useState<Mode>('idle');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const setup = useBeginTwoFactorSetup();
  const enable = useEnableTwoFactor();
  const regenerate = useRegenerateBackupCodes();
  const disable = useDisableTwoFactor();
  const setupError = useCodeErrorMessage(setup.error);
  const isStaff = account.staffRole !== StaffRole.NONE;

  const reset = () => {
    setMode('idle');
    setup.reset();
    enable.reset();
    regenerate.reset();
    disable.reset();
  };

  if (backupCodes) {
    return (
      <BackupCodesPanel
        codes={backupCodes}
        onDone={() => {
          setBackupCodes(null);
          reset();
        }}
      />
    );
  }

  const StatusIcon = account.twoFactorEnabled ? ShieldCheck : ShieldOff;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6">
          <StatusIcon
            aria-hidden="true"
            className={
              account.twoFactorEnabled ? 'size-5 text-viratec-accent' : 'size-5 text-white'
            }
          />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-medium text-white">
            {account.twoFactorEnabled ? t.statusOn : t.statusOff}
          </p>
          <p className="text-sm leading-5 text-viratec-muted">
            {account.twoFactorEnabled ? t.descriptionOn : t.descriptionOff}
          </p>
        </div>
      </div>

      {!account.twoFactorEnabled && mode === 'idle' && (
        <Button
          label={t.enable}
          loading={setup.isPending}
          onClick={() => setup.mutate(undefined, { onSuccess: () => setMode('setup') })}
          className="self-start"
        />
      )}
      {setupError && mode === 'idle' && (
        <p role="alert" className="text-sm text-state-error">
          {setupError}
        </p>
      )}

      {mode === 'setup' && setup.data && (
        <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="flex gap-2 text-[15px] text-white">
            <Smartphone aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {t.step1}
          </p>
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-white">{t.step2}</p>
            <img
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(setup.data.qrCodeSvg)}`}
              alt={t.qrAlt}
              width={200}
              height={200}
              className="size-[200px] rounded-xl bg-white p-2"
            />
            <p className="text-sm text-viratec-muted">{t.manual}</p>
            <code className="self-start rounded-lg bg-black/30 px-3 py-2 font-mono text-sm tracking-[0.12em] break-all text-white">
              {setup.data.manualKey}
            </code>
          </div>
          <p className="text-[15px] text-white">{t.step3}</p>
          <CodePrompt
            numericOnly
            submitLabel={t.confirm}
            isPending={enable.isPending}
            error={enable.error}
            onCancel={reset}
            onSubmit={(code) =>
              enable.mutate(code, { onSuccess: ({ backupCodes: codes }) => setBackupCodes(codes) })
            }
          />
        </div>
      )}

      {account.twoFactorEnabled && mode === 'idle' && (
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" label={t.regenerate} onClick={() => setMode('regenerate')} />
          {!isStaff && (
            <Button variant="secondary" label={t.disable} onClick={() => setMode('disable')} />
          )}
        </div>
      )}
      {account.twoFactorEnabled && isStaff && mode === 'idle' && (
        <p className="text-sm text-viratec-subtle">{t.staffRequired}</p>
      )}

      {mode === 'regenerate' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-viratec-muted">{t.regenerateHint}</p>
          <CodePrompt
            submitLabel={t.regenerate}
            isPending={regenerate.isPending}
            error={regenerate.error}
            onCancel={reset}
            onSubmit={(code) =>
              regenerate.mutate(code, {
                onSuccess: ({ backupCodes: codes }) => setBackupCodes(codes),
              })
            }
          />
        </div>
      )}

      {mode === 'disable' && (
        <CodePrompt
          submitLabel={t.disableConfirm}
          isPending={disable.isPending}
          error={disable.error}
          onCancel={reset}
          onSubmit={(code) => disable.mutate(code, { onSuccess: reset })}
        />
      )}
    </div>
  );
}
