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

export const ADMIN_QUERY_KEY = ['admin'] as const;

const noRetryOnAuthErrors = (failureCount: number, error: unknown) =>
  failureCount < 2 &&
  !(error instanceof Error && 'status' in error && [401, 403].includes(Number(error.status)));

export const useAdminCapabilities = () =>
  useQuery({
    queryKey: [...ADMIN_QUERY_KEY, 'me'],
    queryFn: fetchAdminCapabilities,
    retry: noRetryOnAuthErrors,
  });

export const useAdminMetrics = () =>
  useQuery({
    queryKey: [...ADMIN_QUERY_KEY, 'metrics'],
    queryFn: fetchAdminMetrics,
    retry: noRetryOnAuthErrors,
    refetchInterval: 60_000,
  });

export const useAdminUsers = (query: AdminUsersQuery) =>
  useQuery({
    queryKey: [...ADMIN_QUERY_KEY, 'users', query],
    queryFn: () => fetchAdminUsers(query),
    retry: noRetryOnAuthErrors,
    placeholderData: keepPreviousData,
  });

export const useAuditLog = (page: number, action: string) =>
  useQuery({
    queryKey: [...ADMIN_QUERY_KEY, 'audit', page, action],
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY }),
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
