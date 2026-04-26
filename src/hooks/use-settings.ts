import { useCallback, useEffect, useState } from 'react';

import type { Settings, SettingsKey } from '@/ipc/settings/types';

type SetInput =
  | { key: 'theme'; value: Settings['theme'] }
  | { key: 'telemetryHz'; value: Settings['telemetryHz'] };

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    window.api.invoke('settings:get-all', undefined).then(initial => {
      if (!cancelled) setSettings(initial);
    });
    const off = window.api.on('settings:changed', next => {
      setSettings(next);
    });
    return () => {
      cancelled = true;
      off();
    };
  }, []);

  const get = useCallback(<K extends SettingsKey>(key: K) => {
    return window.api.invoke('settings:get', { key }) as Promise<Settings[K]>;
  }, []);

  const set = useCallback((input: SetInput) => {
    return window.api.invoke('settings:set', input);
  }, []);

  return { settings, get, set };
};
