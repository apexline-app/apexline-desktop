import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Settings, SettingsSetInput } from '@/features/settings/contracts';

import { settingsQueryKey } from './use-settings-query';

const setSettings = (input: SettingsSetInput) =>
  window.api.invoke('settings:set', input);

/**
 * Optimistic update: write the new key/value into the Query cache before
 * the IPC round-trip resolves so toggles feel instant. On error, restore
 * the previous snapshot. The `settings:changed` broadcast (handled in
 * useSettingsQuery) replaces the cache with the canonical main-side
 * payload — making this safe even if optimistic shape diverges.
 */
export const useSettingsMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: setSettings,
    onMutate: async input => {
      await qc.cancelQueries({ queryKey: settingsQueryKey });
      const previous = qc.getQueryData<Settings>(settingsQueryKey);
      if (previous) {
        qc.setQueryData<Settings>(settingsQueryKey, {
          ...previous,
          [input.key]: input.value,
        });
      }
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(settingsQueryKey, ctx.previous);
      }
    },
  });
};
