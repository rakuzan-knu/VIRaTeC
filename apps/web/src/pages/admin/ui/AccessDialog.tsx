import { useState, type FormEvent } from 'react';
import { ShieldAlert } from 'lucide-react';
import {
  ADMIN_PERMISSION_PRESETS,
  ALL_ADMIN_PERMISSIONS,
  StaffRole,
  type AdminPermission,
  type AdminPermissionPreset,
  type AdminUserDto,
} from '@viratec/contracts';
import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';
import { cn } from '@/shared/lib';
import { useAdminMessages } from '../model/messages';
import { useUpdateStaffAccess } from '../model/queries';
import { useRunWithStepUp } from '../model/stepUp';

const PRESETS = Object.keys(ADMIN_PERMISSION_PRESETS) as AdminPermissionPreset[];

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

interface AccessDialogProps {
  user: AdminUserDto;
  onClose: () => void;
}

export function AccessDialog({ user, onClose }: AccessDialogProps) {
  const t = useAdminMessages();
  const runWithStepUp = useRunWithStepUp();
  const update = useUpdateStaffAccess();
  const [selected, setSelected] = useState<Set<AdminPermission>>(
    () => new Set(user.staffRole === StaffRole.ADMIN ? user.permissions : []),
  );
  const [expiresOn, setExpiresOn] = useState(toDateInput(user.staffExpiresAt));
  const [showEmptyError, setShowEmptyError] = useState(false);

  const toggle = (permission: AdminPermission) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selected.size === 0) {
      setShowEmptyError(true);
      return;
    }
    await runWithStepUp(() =>
      update.mutateAsync({
        userId: user.id,
        dto: {
          staffRole: StaffRole.ADMIN,
          permissions: ALL_ADMIN_PERMISSIONS.filter((permission) => selected.has(permission)),
          expiresAt: expiresOn ? new Date(`${expiresOn}T23:59:59`).toISOString() : null,
        },
      }),
    )
      .then(onClose)
      .catch(() => undefined);
  };

  return (
    <Dialog
      open
      title={t.access.title(user.name)}
      description={t.access.description}
      closeLabel={t.close}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {!user.twoFactorEnabled && (
          <p className="flex gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/8 p-3 text-sm leading-5 text-amber-100">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {t.access.noTwoFactor}
          </p>
        )}

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-medium text-viratec-muted">
            {t.access.presets}
          </legend>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelected(new Set(ADMIN_PERMISSION_PRESETS[preset]));
                  setShowEmptyError(false);
                }}
                className="rounded-full border border-white/18 bg-white/4 px-4 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
              >
                {t.access.presetNames[preset]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset
          aria-describedby={showEmptyError ? 'access-empty-error' : undefined}
          className="flex flex-col gap-2"
        >
          <legend className="mb-3 text-sm font-medium text-viratec-muted">
            {t.access.permissions}
          </legend>
          {ALL_ADMIN_PERMISSIONS.map((permission) => (
            <label
              key={permission}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors',
                selected.has(permission)
                  ? 'border-viratec-lime/50 bg-viratec-lime/6'
                  : 'border-white/10 hover:bg-white/4',
              )}
            >
              <input
                type="checkbox"
                checked={selected.has(permission)}
                onChange={() => {
                  toggle(permission);
                  setShowEmptyError(false);
                }}
                className="mt-1 size-4 shrink-0 accent-viratec-lime"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-medium text-white">
                  {t.permissions[permission].label}
                </span>
                <span className="text-sm text-viratec-muted">
                  {t.permissions[permission].description}
                </span>
              </span>
            </label>
          ))}
          {showEmptyError && (
            <p id="access-empty-error" role="alert" className="text-sm text-state-error">
              {t.access.selectOne}
            </p>
          )}
        </fieldset>

        <div className="flex flex-col gap-2">
          <label htmlFor="access-expiry" className="text-sm font-medium text-viratec-muted">
            {t.access.expiry}
          </label>
          <input
            id="access-expiry"
            type="date"
            min={tomorrow()}
            value={expiresOn}
            onChange={(event) => setExpiresOn(event.target.value)}
            aria-describedby="access-expiry-hint"
            className="w-full max-w-[240px] rounded-control border border-border-default bg-bg-input px-4 py-3 text-white [color-scheme:dark] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
          />
          <p id="access-expiry-hint" className="text-xs text-viratec-subtle">
            {t.access.expiryHint}
          </p>
        </div>

        {update.isError && (
          <p role="alert" className="text-sm text-state-error">
            {update.error.message || t.users.actionFailed}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" label={t.access.save} loading={update.isPending} />
          <Button variant="secondary" label={t.access.cancel} onClick={onClose} />
        </div>
      </form>
    </Dialog>
  );
}
