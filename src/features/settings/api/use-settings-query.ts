import { useEffect } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

export const settingsQueryKey = ['settings'] as const;

const fetchSettings = () => window.api.invoke('settings:get-all', undefined);

/**
 * Fetches the full settings snapshot from main. Subscribes to
 * `settings:changed` IPC events and pushes new payload directly into the
 * Query cache via `setQueryData` — this avoids refetch round-trips when
 * main already provides the full object in the event.
 */
export const useSettingsQuery = () => {
  const qc = useQueryClient();

  useEffect(() => {
    const unsubscribe = window.api.on('settings:changed', next => {
      qc.setQueryData(settingsQueryKey, next);
    });
    return unsubscribe;
  }, [qc]);

  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: fetchSettings,
    staleTime: Infinity, // settings change only via mutation/event — never stale by time
  });
};
