"use client";

import { useMemo } from "react";
import { VaultSend } from "@/types/vault";
import { useEncryptedStore } from "./useEncryptedStore";

const SEND_STORAGE_KEY = "vaultwise-sends";

const STARTER_SENDS: VaultSend[] = [
  {
    id: "send-101",
    name: "Staging SSH Key & Root Token",
    type: "text",
    text: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK+4sB/staging-root-token-northstar",
    maxAccessCount: 5,
    accessCount: 2,
    createdAt: "Yesterday",
    expiresAt: "In 6 days",
    password: "safe",
    notes: "Shared with external security auditor",
  },
  {
    id: "send-102",
    name: "Temporary Postgres DB Port Forward",
    type: "text",
    text: "postgres://readonly:p90x_sec_77@db.northstar.internal:5432/analytics",
    maxAccessCount: 1,
    accessCount: 0,
    createdAt: "Today",
    expiresAt: "In 23 hours",
    notes: "Single-view link for contractor data migration",
  },
];

export function useVaultSend() {
  const [sends, setSends] = useEncryptedStore<VaultSend[]>(
    SEND_STORAGE_KEY,
    STARTER_SENDS
  );

  const activeSends = useMemo(() => {
    return sends.filter((s) => !s.disabled);
  }, [sends]);

  const createSend = (newSend: Omit<VaultSend, "id" | "createdAt" | "accessCount">) => {
    const item: VaultSend = {
      ...newSend,
      id: `send-${Date.now()}`,
      createdAt: "Just now",
      accessCount: 0,
    };
    setSends((prev) => [item, ...prev]);
    return item;
  };

  const deleteSend = (id: string) => {
    setSends((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSendDisable = (id: string) => {
    setSends((prev) =>
      prev.map((s) => (s.id === id ? { ...s, disabled: !s.disabled } : s))
    );
  };

  const incrementAccessCount = (id: string) => {
    setSends((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextCount = s.accessCount + 1;
        const isExpired = s.maxAccessCount ? nextCount >= s.maxAccessCount : false;
        return {
          ...s,
          accessCount: nextCount,
          disabled: isExpired ? true : s.disabled,
        };
      })
    );
  };

  return {
    sends,
    activeSends,
    createSend,
    deleteSend,
    toggleSendDisable,
    incrementAccessCount,
  };
}

