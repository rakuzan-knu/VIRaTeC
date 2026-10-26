import { AdminPermission, type RecordResource } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';

export const NO_PERMISSIONS: readonly AdminPermission[] = [];

export const useCanOpenSiteEditor = () =>
  useSessionStore((state) =>
    Boolean(state.user?.permissions.includes(AdminPermission.CONTENT_VIEW)),
  );

export const canEditRecords = (permissions: readonly AdminPermission[], resource: RecordResource) =>
  permissions.includes(AdminPermission.CONTENT_EDIT) ||
  (resource === 'event' && permissions.includes(AdminPermission.EVENTS_MANAGE));
