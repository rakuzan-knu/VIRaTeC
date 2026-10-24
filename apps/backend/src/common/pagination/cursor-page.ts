import type { CursorPage } from '@viratec/contracts';
import type { CursorQueryDto } from '../dto/cursor-query.dto';

export const cursorArgs = ({ limit, cursor }: CursorQueryDto) => ({
  take: limit + 1,
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
});

export const cursorCacheKey = ({ limit, cursor }: CursorQueryDto, filter?: string) =>
  `${filter ?? ''}|${cursor ?? ''}|${limit}`;

export function toCursorPage<T extends { id: string }>(rows: T[], limit: number): CursorPage<T> {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return { data, meta: { nextCursor: hasMore ? data[data.length - 1].id : null, limit } };
}
