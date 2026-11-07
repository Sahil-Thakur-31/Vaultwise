"use client";

import { useCallback } from "react";
import { VaultSettings } from "@/types/vault";
import { useLocalStorage } from "./useLocalStorage";

const SETTINGS_STORAGE_KEY = "vaultwise-settings";

const DEFAULT_SETTINGS: VaultSettings = {
  vaultTimeout: "15min",
  vaultTimeoutAction: "lock",
  clearClipboardDelay: 30,
  biometricsEnabled: true,
  masterPasswordHint: "Standard company dev seed (default: vaultwise)",
  density: "comfortable",
  accentColor: "blue",
  enablePrivacyBlur: true,
};

export function useVaultSettings() {
  const [settings, setSettings] = useLocalStorage<VaultSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS
  );

  const updateSettings = useCallback(
    (updates: Partial<VaultSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [setSettings]
  );

  return {
    settings,
    updateSettings,
  };
}
