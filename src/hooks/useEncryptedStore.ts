"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVaultCrypto } from "@/context/VaultCryptoContext";
import { decryptData, encryptData, EncryptedEnvelope } from "@/lib/vaultCrypto";

export function useEncryptedStore<T>(
  key: string,
  initialValue: T,
  legacyFallbackKey?: string
): [T, (action: T | ((prev: T) => T)) => void] {
  const { sessionKey } = useVaultCrypto();
  const [data, setData] = useState<T>(initialValue);

  const storageKey = `vaultwise-enc-${key}`;
  const isMigratedRef = useRef(false);

  // Decrypt and load whenever sessionKey becomes available or changes
  useEffect(() => {
    if (typeof window === "undefined" || !sessionKey) return;

    let isCancelled = false;

    async function loadEncryptedData() {
      try {
        const encryptedRaw = window.localStorage.getItem(storageKey);

        if (encryptedRaw) {
          const envelope: EncryptedEnvelope = JSON.parse(encryptedRaw);
          if (envelope && envelope.version === 2 && envelope.ciphertext && envelope.iv) {
            const decrypted = await decryptData<T>(envelope, sessionKey!);
            if (!isCancelled) {
              setData(decrypted);
            }
            return;
          }
        }

        // Check if legacy unencrypted plaintext exists to auto-migrate to AES-256-GCM
        const legacyRaw =
          window.localStorage.getItem(key) ||
          (legacyFallbackKey ? window.localStorage.getItem(legacyFallbackKey) : null);

        if (legacyRaw && !isMigratedRef.current) {
          isMigratedRef.current = true;
          try {
            const legacyParsed = JSON.parse(legacyRaw) as T;
            if (!isCancelled) {
              setData(legacyParsed);
            }
            // Encrypt with fresh AES-256-GCM key and purge plaintext
            const envelope = await encryptData(legacyParsed, sessionKey!);
            window.localStorage.setItem(storageKey, JSON.stringify(envelope));
            window.localStorage.removeItem(key);
            if (legacyFallbackKey) window.localStorage.removeItem(legacyFallbackKey);
            return;
          } catch {
            // Ignore parse error on corrupt legacy data
          }
        }

        // If no encrypted data and no legacy data, encrypt the starter/initial data
        if (!encryptedRaw) {
          const envelope = await encryptData(initialValue, sessionKey!);
          window.localStorage.setItem(storageKey, JSON.stringify(envelope));
        }
      } catch (err) {
        console.warn(`[Vaultwise Enclave] Could not decrypt "${storageKey}". Awaiting correct master passphrase.`, err);
      }
    }

    loadEncryptedData();

    return () => {
      isCancelled = true;
    };
  }, [sessionKey, storageKey, key, legacyFallbackKey, initialValue]);

  // Setter: Updates state in-memory and re-encrypts to disk
  const setValue = useCallback(
    (action: T | ((prev: T) => T)) => {
      setData((prev) => {
        const nextValue = typeof action === "function" ? (action as (prev: T) => T)(prev) : action;

        // Asynchronously encrypt to storage with fresh 12-byte IV
        if (typeof window !== "undefined" && sessionKey) {
          encryptData(nextValue, sessionKey)
            .then((envelope) => {
              window.localStorage.setItem(storageKey, JSON.stringify(envelope));
              // Ensure legacy plaintext is purged
              window.localStorage.removeItem(key);
              if (legacyFallbackKey) window.localStorage.removeItem(legacyFallbackKey);
            })
            .catch((err) => {
              console.error(`[Vaultwise Enclave] Failed to encrypt "${storageKey}":`, err);
            });
        }

        return nextValue;
      });
    },
    [sessionKey, storageKey, key, legacyFallbackKey]
  );

  return [data, setValue];
}
