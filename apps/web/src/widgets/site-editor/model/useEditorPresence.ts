import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PRESENCE_LIMITS, type EditorPresenceDto } from '@viratec/contracts';
import { updatePresence } from '../api/editorApi';
import { EDITOR_QUERY_KEY } from './queries';

const NO_PRESENCE: EditorPresenceDto[] = [];

const releasePresence = () => {
  updatePresence({ resourceKeys: [] }).catch(() => undefined);
};

export function useEditorPresence(resourceKey: string | null) {
  const query = useQuery({
    queryKey: [...EDITOR_QUERY_KEY, 'presence', resourceKey],
    queryFn: () => updatePresence({ resourceKeys: resourceKey ? [resourceKey] : [] }),
    enabled: resourceKey !== null,
    refetchInterval: PRESENCE_LIMITS.heartbeatMs,
    refetchIntervalInBackground: false,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (!resourceKey) return;
    return releasePresence;
  }, [resourceKey]);

  const others = (resourceKey && query.data) || NO_PRESENCE;
  const names = [...new Map(others.map((item) => [item.userId, item.name])).values()];
  return names;
}
