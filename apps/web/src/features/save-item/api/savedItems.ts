import { api } from '@/shared/api/apiClient';
import type { SavedItemDto, SavedItemRequestDto } from '@viratec/contracts';

export const fetchSavedItems = (): Promise<SavedItemDto[]> =>
  api.get<SavedItemDto[]>('/users/me/saved');

export const saveItemRequest = (dto: SavedItemRequestDto): Promise<SavedItemDto[]> =>
  api.put<SavedItemDto[]>('/users/me/saved', dto);

export const clearSavedItemsRequest = (): Promise<SavedItemDto[]> =>
  api.delete<SavedItemDto[]>('/users/me/saved/all');

export const removeSavedItemRequest = (dto: SavedItemRequestDto): Promise<SavedItemDto[]> =>
  api.delete<SavedItemDto[]>('/users/me/saved', dto);
