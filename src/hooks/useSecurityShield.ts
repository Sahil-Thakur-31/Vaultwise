"use client";

import { useEffect, useState } from "react";
import { copySensitiveText } from "@/lib/clipboard";

interface SecurityShieldOptions {
  onLockVault: () => void;
  onNotify: (msg: string) => void;
  clipboardDelaySeconds?: number;
  enablePrivacyBlur?: boolean;
}

export function useSecurityShield({
  onLockVault,
  onNotify,
  clipboardDelaySeconds = 30,
  enablePrivacyBlur = true,
}: SecurityShieldOptions) {
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);

  // 1. Right-Click & DevTools Shortcuts Lockout
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Prevent native browser/Chromium DevTools context menu
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isDevToolsKey =
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          ["i", "j", "c"].includes(e.key.toLowerCase())) ||
        ((e.ctrlKey || e.metaKey) && ["u", "s", "p"].includes(e.key.toLowerCase()));

      if (isDevToolsKey) {
        e.preventDefault();
        onNotify("Security Policy: Developer tools and source inspection are disabled.");
      }
    };

    // 2. DevTools open heuristic detection (auto-lock vault if console is forced open)
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        onLockVault();
        onNotify("Security Alert: Developer tools detected. Vault locked immediately.");
      }
    };

    // 3. Window blur / Tab switch privacy shield
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && enablePrivacyBlur) {
        setIsPrivacyMasked(true);
      }
    };

    const handleWindowBlur = () => {
      if (enablePrivacyBlur) {
        setIsPrivacyMasked(true);
      }
    };

    const handleWindowFocus = () => {
      // Keep masked until user explicitly interacts or unmasks
    };

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("resize", checkDevTools);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("resize", checkDevTools);
    };
  }, [onLockVault, onNotify, enablePrivacyBlur]);

  // Secure copy with automatic clipboard wipe
  const copyWithAutoPurge = async (text: string, label: string) => {
    return copySensitiveText(text, label, clipboardDelaySeconds, onNotify);
  };

  const dismissPrivacyMask = () => {
    setIsPrivacyMasked(false);
  };

  return {
    isPrivacyMasked,
    dismissPrivacyMask,
    copyWithAutoPurge,
  };
}
