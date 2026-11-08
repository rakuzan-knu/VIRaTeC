import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchUnsubscribePreview, unsubscribeByTokenRequest } from '../api/eventRegistration';

export const useUnsubscribeByToken = () => useMutation({ mutationFn: unsubscribeByTokenRequest });

export const useUnsubscribePreview = (token: string | null) =>
  useQuery({
    queryKey: ['event-unsubscribe', token],
    queryFn: () => fetchUnsubscribePreview(token ?? ''),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });
