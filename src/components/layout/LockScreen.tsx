"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Lock, RefreshCw, ShieldCheck } from "lucide-react";

interface LockScreenProps {
  onUnlock: (passphrase: string) => boolean | Promise<boolean>;
  onNotify: (msg: string) => void;
}

export function LockScreen({ onUnlock, onNotify }: LockScreenProps) {
  const [passphrase, setPassphrase] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passphrase || isVerifying) return;

    setIsVerifying(true);
    try {
      const success = await onUnlock(passphrase);
      if (success) {
        onNotify("Vault unlocked (AES-256-GCM Key Derived)");
        setPassphrase("");
        setHasError(false);
      } else {
        setHasError(true);
        onNotify("Invalid master passphrase or authentication tag failure");
      }
    } catch {
      setHasError(true);
      onNotify("Authentication failure");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-app)] p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 shadow-2xl text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-blue-600 text-white shadow-md">
          <Lock className="size-6" />
        </div>

        <h1 className="text-lg font-bold text-[var(--text-primary)]">
          Vaultwise is Locked
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Enter your master passphrase to derive the AES-256 session key.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <input
              type="password"
              required
              autoFocus
              disabled={isVerifying}
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setHasError(false);
              }}
              placeholder="Master passphrase"
              className={`w-full rounded-lg border bg-[var(--input-bg)] p-3 text-center text-sm text-[var(--text-primary)] outline-none transition ${
                hasError
                  ? "border-rose-500 ring-1 ring-rose-500"
                  : "border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
              }`}
            />
            {hasError && (
              <p className="mt-2 text-xs text-rose-500">
                Incorrect passphrase. Decryption failed.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] p-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] cursor-pointer disabled:opacity-70"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                Deriving AES-256 Key...
              </>
            ) : (
              <>
                Unlock Secure Vault
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)]">
          <ShieldCheck className="size-3 text-emerald-500" />
          <span>PBKDF2 SHA-256 (600,000 iterations) • AES-GCM-256</span>
        </div>
      </div>
    </div>
  );
}
