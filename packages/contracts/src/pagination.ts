export const LIST_PAGE_LIMITS = {
  default: 50,
  max: 100,
} as const;

export interface CursorPageMeta {
  nextCursor: string | null;
  limit: number;
}

export interface CursorPage<T> {
  data: T[];
  meta: CursorPageMeta;
}
