"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, Timer } from "lucide-react";
import { getTOTPCode } from "@/lib/totp";
import { copySensitiveText } from "@/lib/clipboard";

interface TotpAuthenticatorProps {
  secret: string;
  onNotify: (msg: string) => void;
}

const emptySubscribe = () => () => {};

export function TotpAuthenticator({ secret, onNotify }: TotpAuthenticatorProps) {
  // Official React 19 API for hydration-safe client rendering without cascading renders
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [data, setData] = useState(() => getTOTPCode(secret));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Tick every second to update dynamic remaining seconds and code
    const interval = setInterval(() => {
      setData(getTOTPCode(secret));
    }, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  const handleCopy = async () => {
    try {
      const cleanCode = data.code.replace(/\s+/g, "");
      const ok = await copySensitiveText(cleanCode, "2FA Authenticator code", 30, onNotify);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } else {
        onNotify("Failed to copy 2FA code");
      }
    } catch {
      onNotify("Failed to copy 2FA code");
    }
  };

  const isLowTime = isMounted ? data.secondsRemaining <= 5 : false;

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs">
      <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)] mb-1.5">
        <span className="flex items-center gap-1.5">
          <Timer className="size-3.5 text-blue-500" />
          Two-Factor Authenticator (TOTP)
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[var(--accent-primary)] hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
        >
          {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div
          suppressHydrationWarning
          className="font-mono text-xl font-bold tracking-widest text-[var(--text-primary)] select-all"
        >
          {isMounted ? data.code : "••• •••"}
        </div>

        {/* Dynamic Countdown Gauge */}
        <div className="flex items-center gap-2">
          <span
            suppressHydrationWarning
            className={`font-mono text-xs font-semibold ${
              isLowTime ? "text-rose-500 animate-pulse" : "text-[var(--text-secondary)]"
            }`}
          >
            {isMounted ? `${data.secondsRemaining}s` : "30s"}
          </span>

          <div className="h-2 w-16 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div
              suppressHydrationWarning
              className={`h-full transition-all duration-1000 ease-linear ${
                isLowTime ? "bg-rose-500" : "bg-blue-600"
              }`}
              style={{ width: `${isMounted ? data.percentage : 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
