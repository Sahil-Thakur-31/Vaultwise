"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  createMasterVerifier,
  decryptData,
  encryptData,
  EncryptedEnvelope,
  MasterVerifierEnvelope,
  verifyAndDeriveKey,
} from "@/lib/vaultCrypto";
import {
  appendAuditBlock,
  ChainVerificationResult,
  createGenesisBlock,
  verifyChainIntegrity,
} from "@/lib/merkleAudit";
import { generateEmergencyKitText, getOrCreateSecretKey } from "@/lib/secretKey";
import { EmergencyKit, MerkleAuditAction, MerkleAuditBlock } from "@/types/vault";

const MASTER_VERIFIER_KEY = "vaultwise-master-verifier-v2";
const MERKLE_CHAIN_STORAGE_KEY = "vaultwise-merkle-chain-v2";

interface VaultCryptoContextType {
  sessionKey: CryptoKey | null;
  isUnlocked: boolean;
  secretKey: string;
  merkleChain: MerkleAuditBlock[];
  unlockVault: (passphrase: string) => Promise<boolean>;
  lockVault: () => void;
  changeMasterPassphrase: (
    newPassphrase: string,
    onReEncryptAll: (newKey: CryptoKey) => Promise<void>
  ) => Promise<boolean>;
  encryptAndSave: <T>(storageKey: string, data: T) => Promise<void>;
  loadAndDecrypt: <T>(storageKey: string, fallbackData: T) => Promise<T>;
  logAuditEvent: (action: MerkleAuditAction, actor: string, payload: unknown) => Promise<void>;
  verifyAuditLedger: () => Promise<ChainVerificationResult>;
  downloadEmergencyKit: (email?: string, name?: string) => void;
}

const VaultCryptoContext = createContext<VaultCryptoContextType | null>(null);

export function VaultCryptoProvider({ children }: { children: React.ReactNode }) {
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [secretKey] = useState<string>(() => {
    return getOrCreateSecretKey();
  });
  const [merkleChain, setMerkleChain] = useState<MerkleAuditBlock[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(MERKLE_CHAIN_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const isInitializedRef = useRef(false);

  // Initialize master verifier and ensure Merkle genesis block on first boot
  useEffect(() => {
    if (typeof window === "undefined" || isInitializedRef.current) return;
    isInitializedRef.current = true;

    // 1. Ensure Merkle Genesis Block exists
    if (!window.localStorage.getItem(MERKLE_CHAIN_STORAGE_KEY)) {
      createGenesisBlock().then((genesis) => {
        setMerkleChain([genesis]);
        window.localStorage.setItem(MERKLE_CHAIN_STORAGE_KEY, JSON.stringify([genesis]));
      });
    }

    // 2. Master Key Challenge Verifier
    const existingVerifierJson = window.localStorage.getItem(MASTER_VERIFIER_KEY);
    if (!existingVerifierJson) {
      // First boot: Initialize with default passphrase "vaultwise"
      createMasterVerifier("vaultwise").then(({ verifier, key }) => {
        window.localStorage.setItem(MASTER_VERIFIER_KEY, JSON.stringify(verifier));
        setSessionKey(key);
        setIsUnlocked(true);
      });
    } else {
      try {
        const verifier: MasterVerifierEnvelope = JSON.parse(existingVerifierJson);
        verifyAndDeriveKey("vaultwise", verifier).then((key) => {
          if (key) {
            setSessionKey(key);
            setIsUnlocked(true);
          }
        });
      } catch {
        // Keep locked if corrupt
      }
    }
  }, []);

  const logAuditEvent = useCallback(
    async (action: MerkleAuditAction, actor: string, payload: unknown) => {
      setMerkleChain((prev) => {
        // Append block asynchronously and persist
        appendAuditBlock(prev, action, actor, payload).then((updatedChain) => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(MERKLE_CHAIN_STORAGE_KEY, JSON.stringify(updatedChain));
          }
          setMerkleChain(updatedChain);
        });
        return prev;
      });
    },
    []
  );

  const verifyAuditLedger = useCallback(async (): Promise<ChainVerificationResult> => {
    return await verifyChainIntegrity(merkleChain);
  }, [merkleChain]);

  const unlockVault = useCallback(
    async (passphrase: string): Promise<boolean> => {
      if (typeof window === "undefined") return false;

      const verifierRaw = window.localStorage.getItem(MASTER_VERIFIER_KEY);
      if (!verifierRaw) {
        const { verifier, key } = await createMasterVerifier(passphrase);
        window.localStorage.setItem(MASTER_VERIFIER_KEY, JSON.stringify(verifier));
        setSessionKey(key);
        setIsUnlocked(true);
        logAuditEvent("VAULT_UNLOCKED", "Master User", { timestamp: Date.now() });
        return true;
      }

      try {
        const verifier: MasterVerifierEnvelope = JSON.parse(verifierRaw);
        const derivedKey = await verifyAndDeriveKey(passphrase, verifier);

        if (derivedKey) {
          setSessionKey(derivedKey);
          setIsUnlocked(true);
          logAuditEvent("VAULT_UNLOCKED", "Master User", { timestamp: Date.now() });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [logAuditEvent]
  );

  const lockVault = useCallback(() => {
    setSessionKey(null);
    setIsUnlocked(false);
    logAuditEvent("VAULT_LOCKED", "Session Enclave", { timestamp: Date.now() });
  }, [logAuditEvent]);

  const changeMasterPassphrase = useCallback(
    async (
      newPassphrase: string,
      onReEncryptAll: (newKey: CryptoKey) => Promise<void>
    ): Promise<boolean> => {
      if (typeof window === "undefined") return false;

      const { verifier: newVerifier, key: newKey } = await createMasterVerifier(newPassphrase);
      await onReEncryptAll(newKey);

      window.localStorage.setItem(MASTER_VERIFIER_KEY, JSON.stringify(newVerifier));
      setSessionKey(newKey);
      setIsUnlocked(true);

      logAuditEvent("KEY_ROTATED", "Master User", {
        cipher: "AES-GCM-256",
        iterations: 600000,
        timestamp: Date.now(),
      });
      return true;
    },
    [logAuditEvent]
  );

  const encryptAndSave = useCallback(
    async <T,>(storageKey: string, data: T): Promise<void> => {
      if (typeof window === "undefined") return;

      if (!sessionKey) {
        console.warn(`[Vaultwise Crypto] Cannot save to "${storageKey}" while vault is locked.`);
        return;
      }

      const envelope = await encryptData(data, sessionKey);
      window.localStorage.setItem(storageKey, JSON.stringify(envelope));
    },
    [sessionKey]
  );

  const loadAndDecrypt = useCallback(
    async <T,>(storageKey: string, fallbackData: T): Promise<T> => {
      if (typeof window === "undefined") return fallbackData;

      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return fallbackData;

      if (!sessionKey) {
        return fallbackData;
      }

      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 2 && parsed.ciphertext && parsed.iv) {
          return await decryptData<T>(parsed as EncryptedEnvelope, sessionKey);
        }
        return parsed as T;
      } catch (err) {
        console.error(`[Vaultwise Crypto] Failed to decrypt "${storageKey}":`, err);
        return fallbackData;
      }
    },
    [sessionKey]
  );

  const downloadEmergencyKit = useCallback(
    (email: string = "sahil@northstar.io", name: string = "Sahil Kumar") => {
      const kitData: EmergencyKit = {
        accountName: name,
        email,
        secretKey,
        createdDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        cipher: "AES-256-GCM (256-bit symmetric cipher)",
        kdf: "PBKDF2-HMAC-SHA256",
        iterations: 600000,
      };

      const kitText = generateEmergencyKitText(kitData);
      const blob = new Blob([kitText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vaultwise-emergency-kit-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [secretKey]
  );

  return (
    <VaultCryptoContext.Provider
      value={{
        sessionKey,
        isUnlocked,
        secretKey,
        merkleChain,
        unlockVault,
        lockVault,
        changeMasterPassphrase,
        encryptAndSave,
        loadAndDecrypt,
        logAuditEvent,
        verifyAuditLedger,
        downloadEmergencyKit,
      }}
    >
      {children}
    </VaultCryptoContext.Provider>
  );
}

export function useVaultCrypto() {
  const ctx = useContext(VaultCryptoContext);
  if (!ctx) {
    throw new Error("useVaultCrypto must be used within a VaultCryptoProvider");
  }
  return ctx;
}
