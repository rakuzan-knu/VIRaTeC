import { SetMetadata } from '@nestjs/common';
import type { AdminPermission } from '@viratec/contracts';

export const PERMISSIONS_KEY = 'staff:permissions';
export const OWNER_ONLY_KEY = 'staff:owner';
export const STEP_UP_KEY = 'staff:stepUp';

export const RequirePermissions = (...permissions: AdminPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const OwnerOnly = () => SetMetadata(OWNER_ONLY_KEY, true);

export type StepUpScope = 'action' | 'publish';

export const RequireStepUp = (scope: StepUpScope = 'action') => SetMetadata(STEP_UP_KEY, scope);
