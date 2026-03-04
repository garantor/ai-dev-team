import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { UserSettings } from "../types";
import { getSettings, saveSettings, DEFAULT_SETTINGS } from "../utils/storage";

interface SettingsContextValue {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const saved = await getSettings();
        if (!cancelled) setSettings(saved);
      } catch (err) {
        console.error("SettingsContext: failed to load", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const updateSettings = useCallback(async (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await saveSettings(updated);
  }, [settings]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, loading, updateSettings }),
    [settings, loading, updateSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
