import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateStaffAccessRequestDto } from '@viratec/contracts';
import {
  fetchAdminCapabilities,
  fetchAdminMetrics,
  fetchAdminUsers,
  fetchAuditLog,
  revokeStaffAccess,
  revokeUserSessions,
  setUserBlocked,
  updateStaffAccess,
  type AdminUsersQuery,
} from '../api/adminApi';

export const adminKeys = {
  all: ['admin'] as const,
  capabilities: () => [...adminKeys.all, 'me'] as const,
  metrics: () => [...adminKeys.all, 'metrics'] as const,
  users: (query: AdminUsersQuery) => [...adminKeys.all, 'users', query] as const,
  audit: (page: number, action: string) => [...adminKeys.all, 'audit', page, action] as const,
};

const noRetryOnAuthErrors = (failureCount: number, error: unknown) =>
  failureCount < 2 &&
  !(error instanceof Error && 'status' in error && [401, 403].includes(Number(error.status)));

export const useAdminCapabilities = () =>
  useQuery({
    queryKey: adminKeys.capabilities(),
    queryFn: fetchAdminCapabilities,
    retry: noRetryOnAuthErrors,
  });

export const useAdminMetrics = () =>
  useQuery({
    queryKey: adminKeys.metrics(),
    queryFn: fetchAdminMetrics,
    retry: noRetryOnAuthErrors,
    refetchInterval: 60_000,
  });

export const useAdminUsers = (query: AdminUsersQuery) =>
  useQuery({
    queryKey: adminKeys.users(query),
    queryFn: () => fetchAdminUsers(query),
    retry: noRetryOnAuthErrors,
    placeholderData: keepPreviousData,
  });

export const useAuditLog = (page: number, action: string) =>
  useQuery({
    queryKey: adminKeys.audit(page, action),
    queryFn: () => fetchAuditLog(page, action),
    retry: noRetryOnAuthErrors,
    placeholderData: keepPreviousData,
  });

function useAdminMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

export const useUpdateStaffAccess = () =>
  useAdminMutation(({ userId, dto }: { userId: string; dto: UpdateStaffAccessRequestDto }) =>
    updateStaffAccess(userId, dto),
  );

export const useRevokeStaffAccess = () => useAdminMutation(revokeStaffAccess);

export const useSetUserBlocked = () =>
  useAdminMutation(({ userId, blocked }: { userId: string; blocked: boolean }) =>
    setUserBlocked(userId, blocked),
  );

export const useRevokeUserSessions = () => useAdminMutation(revokeUserSessions);
