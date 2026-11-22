import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { EventAccessDto, EventListScope } from '@viratec/contracts';
import { useLocale } from '@/shared/i18n';
import { useRecordOverlay } from '@/shared/lib';
import {
  EVENT_PREVIEW,
  fetchEvent,
  fetchEventAccess,
  fetchEvents,
  fetchMyEvents,
} from '../api/eventApi';
import { localizeEvent } from '../lib/localize';
import type { EventResponse } from './types';

const ACCESS_IDLE_REFRESH_MS = 5 * 60_000;
const ACCESS_UPCOMING_REFRESH_MS = 15 * 60_000;
const ACCESS_RETRY_MS = 5_000;
const ACCESS_OPENING_JITTER_MS = 10_000;

export const eventKeys = {
  all: ['events'] as const,
  list: (scope: EventListScope) => [...eventKeys.all, 'list', scope] as const,
  detail: (eventId: string) => [...eventKeys.all, 'detail', eventId] as const,
  access: (eventId: string, userId: string | null) =>
    [...eventKeys.all, 'access', eventId, userId ?? 'anonymous'] as const,
  mine: (userId: string | null) => [...eventKeys.all, 'mine', userId ?? 'anonymous'] as const,
};

const accessRefreshInterval = (access: EventAccessDto | undefined) => {
  if (access?.state === 'ENDED' || access?.state === 'CANCELLED') return false;
  if (access?.state !== 'NOT_YET') return ACCESS_IDLE_REFRESH_MS;
  const remainingMs = Date.parse(access.opensAt) - Date.now();
  if (remainingMs <= 0) return ACCESS_RETRY_MS;
  return Math.min(
    ACCESS_UPCOMING_REFRESH_MS,
    remainingMs + Math.random() * ACCESS_OPENING_JITTER_MS,
  );
};

export function useEvents(scope: EventListScope) {
  const locale = useLocale();
  const overlay = useRecordOverlay(EVENT_PREVIEW);
  const select = useCallback(
    (events: EventResponse[]) => overlay(events).map((event) => localizeEvent(event, locale)),
    [locale, overlay],
  );
  return useQuery({
    queryKey: eventKeys.list(scope),
    queryFn: () => fetchEvents(scope),
    select,
    staleTime: 60_000,
  });
}

export function useEvent(eventId: string | undefined) {
  const locale = useLocale();
  const overlay = useRecordOverlay(EVENT_PREVIEW);
  const select = useCallback(
    (event: EventResponse) => localizeEvent(overlay([event])[0] ?? event, locale),
    [locale, overlay],
  );
  return useQuery({
    queryKey: eventKeys.detail(eventId ?? ''),
    queryFn: () => fetchEvent(eventId ?? ''),
    select,
    enabled: Boolean(eventId),
    staleTime: 60_000,
  });
}

export function useEventAccess(eventId: string, userId: string | null) {
  return useQuery({
    queryKey: eventKeys.access(eventId, userId),
    queryFn: () => fetchEventAccess(eventId, userId),
    refetchInterval: (query) => accessRefreshInterval(query.state.data),
  });
}

export function useMyEvents(userId: string | null) {
  const locale = useLocale();
  const select = useCallback(
    (events: EventResponse[]) => events.map((event) => localizeEvent(event, locale)),
    [locale],
  );
  return useQuery({
    queryKey: eventKeys.mine(userId),
    queryFn: fetchMyEvents,
    select,
    enabled: userId !== null,
    staleTime: 60_000,
  });
}
