"use client";

import { useCallback, useState } from "react";
import { useVaultCrypto } from "@/context/VaultCryptoContext";

export function useVaultLock() {
  const { sessionKey, isUnlocked, unlockVault, lockVault, changeMasterPassphrase } =
    useVaultCrypto();

  const [isManuallyLocked, setIsManuallyLocked] = useState(false);

  // Locked if cryptographic session key is not derived or user clicked Lock
  const isLocked = !isUnlocked || isManuallyLocked;

  const lock = useCallback(() => {
    setIsManuallyLocked(true);
    lockVault();
  }, [lockVault]);

  const unlock = useCallback(
    async (inputPassphrase: string): Promise<boolean> => {
      const success = await unlockVault(inputPassphrase);
      if (success) {
        setIsManuallyLocked(false);
        return true;
      }
      return false;
    },
    [unlockVault]
  );

  const changePassphrase = useCallback(
    async (
      newPassphrase: string,
      onReEncryptAll?: (newKey: CryptoKey) => Promise<void>
    ): Promise<boolean> => {
      return await changeMasterPassphrase(
        newPassphrase,
        onReEncryptAll || (async () => {})
      );
    },
    [changeMasterPassphrase]
  );

  return {
    isLocked,
    sessionKey,
    lock,
    unlock,
    changePassphrase,
  };
}
