import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SavedItemDto, SavedItemRequestDto } from '@viratec/contracts';
import { useIsAuthenticated, useSessionStore } from '@/entities/session';
import {
  clearSavedItemsRequest,
  fetchSavedItems,
  removeSavedItemRequest,
  saveItemRequest,
} from '../api/savedItems';

const savedKeys = {
  all: ['saved-items'] as const,
  list: (userId: string | null) => [...savedKeys.all, userId ?? 'anonymous'] as const,
};

const isSameItem = (item: SavedItemDto, target: SavedItemRequestDto) =>
  item.kind === target.kind && item.refId === target.refId;

export function useSavedItems() {
  const isAuthenticated = useIsAuthenticated();
  const userId = useSessionStore((state) => state.user?.id ?? null);

  return useQuery({
    queryKey: savedKeys.list(userId),
    queryFn: fetchSavedItems,
    enabled: isAuthenticated && userId !== null,
    staleTime: 60_000,
  });
}

interface ToggleVariables {
  item: SavedItemRequestDto;
  save: boolean;
}

export function useToggleSaved() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id ?? null);
  const key = savedKeys.list(userId);

  return useMutation({
    mutationFn: ({ item, save }: ToggleVariables) =>
      save ? saveItemRequest(item) : removeSavedItemRequest(item),
    onMutate: async ({ item, save }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SavedItemDto[]>(key);
      queryClient.setQueryData<SavedItemDto[]>(key, (items = []) =>
        save
          ? [{ ...item, createdAt: new Date().toISOString(), project: null }, ...items]
          : items.filter((saved) => !isSameItem(saved, item)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSuccess: (items) => {
      queryClient.setQueryData(key, items);
    },
  });
}

export function useClearSaved() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((state) => state.user?.id ?? null);

  return useMutation({
    mutationFn: clearSavedItemsRequest,
    onSuccess: (items) => queryClient.setQueryData(savedKeys.list(userId), items),
  });
}

export const isItemSaved = (items: SavedItemDto[] | undefined, item: SavedItemRequestDto) =>
  Boolean(items?.some((saved) => isSameItem(saved, item)));
