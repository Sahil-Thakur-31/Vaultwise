/**
 * Vaultwise Safe Clipboard Subsystem
 * Supports Electron Desktop IPC, Modern Clipboard API, and DOM execCommand fallback.
 * Catches all permission exceptions to prevent unhandled promise rejections.
 * Includes OS-level auto-purge timer for passwords and sensitive credentials.
 */

declare global {
  interface Window {
    vaultDesktop?: {
      isDesktop?: boolean;
      platform?: string;
      version?: string;
      lockApp?: () => void;
      minimize?: () => void;
      maximize?: () => void;
      close?: () => void;
      writeClipboard?: (text: string) => void;
      clearClipboard?: () => void;
      scheduleClearClipboard?: (delayMs: number) => void;
      cancelClearClipboard?: () => void;
      onClipboardCleared?: (callback: () => void) => () => void;
    };
  }
}

let activeClearTimer: NodeJS.Timeout | null = null;
let pendingPurgeDueTimestamp: number | null = null;
let hasRegisteredFocusWiper = false;
const onPurgedCallbacks: Set<() => void> = new Set();

/**
 * Gets the configured clipboard clear delay in seconds from user settings.
 * Defaults to 30 seconds. If set to 0, auto-clear is disabled.
 */
export function getClipboardClearDelay(): number {
  if (typeof window === "undefined") return 30;
  try {
    const raw = localStorage.getItem("vaultwise-settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.clearClipboardDelay === "number") {
        return parsed.clearClipboardDelay;
      }
    }
  } catch {
    // Return default if error reading localStorage
  }
  return 30;
}

function registerBrowserFocusWiper() {
  if (hasRegisteredFocusWiper || typeof window === "undefined") return;
  hasRegisteredFocusWiper = true;

  const checkAndPurgeIfDue = async () => {
    if (pendingPurgeDueTimestamp && Date.now() >= pendingPurgeDueTimestamp) {
      pendingPurgeDueTimestamp = null;
      if (activeClearTimer) {
        clearTimeout(activeClearTimer);
        activeClearTimer = null;
      }
      await clearClipboardSafely();
      onPurgedCallbacks.forEach((cb) => {
        try {
          cb();
        } catch {
          // Ignore
        }
      });
      onPurgedCallbacks.clear();
    }
  };

  window.addEventListener("focus", checkAndPurgeIfDue);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkAndPurgeIfDue();
    }
  });

  // Listen to Electron native background clear event if present
  if (window.vaultDesktop?.onClipboardCleared) {
    window.vaultDesktop.onClipboardCleared(() => {
      pendingPurgeDueTimestamp = null;
      if (activeClearTimer) {
        clearTimeout(activeClearTimer);
        activeClearTimer = null;
      }
      onPurgedCallbacks.forEach((cb) => {
        try {
          cb();
        } catch {
          // Ignore
        }
      });
      onPurgedCallbacks.clear();
    });
  }
}

/**
 * Copies text to the OS clipboard safely across any browser or desktop environment.
 * Never throws unhandled rejections if permission is denied or window is unfocused.
 */
export async function copyTextSafely(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. Electron Desktop IPC (native OS access without permission prompts)
  if (window.vaultDesktop?.writeClipboard) {
    try {
      window.vaultDesktop.writeClipboard(text);
      return true;
    } catch {
      // Fall through to browser clipboard API
    }
  }

  // 2. Modern W3C Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or unfocused; fall through to DOM execCommand fallback
    }
  }

  // 3. Document execCommand fallback (works in restricted or legacy contexts)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Purges the OS clipboard safely.
 * Never throws unhandled rejections if permission is denied or window is unfocused.
 */
export async function clearClipboardSafely(): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Electron Desktop IPC
  if (window.vaultDesktop?.clearClipboard) {
    try {
      window.vaultDesktop.clearClipboard();
      return;
    } catch {
      // Fall through
    }
  }

  // 2. Modern Clipboard API
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText("");
      return;
    } catch {
      // Fall through
    }
  }

  // 3. Fallback
  try {
    await copyTextSafely("");
  } catch {
    // Ignore error
  }
}

/**
 * Copies a sensitive credential (password, TOTP code, payment card, recovery key)
 * to the OS clipboard and schedules automatic purging after a delay (default: 30s or user setting).
 *
 * In Electron, it runs a background native timer that clears the OS clipboard even if minimized.
 * In Web browsers, it clears on schedule or immediately upon refocus if the tab was suspended.
 */
export async function copySensitiveText(
  text: string,
  label: string = "Password",
  customDelaySeconds?: number,
  onNotify?: (msg: string) => void
): Promise<boolean> {
  registerBrowserFocusWiper();

  const success = await copyTextSafely(text);
  if (!success) {
    onNotify?.("Failed to copy to clipboard");
    return false;
  }

  // Cancel any existing pending clipboard clear timers
  if (activeClearTimer) {
    clearTimeout(activeClearTimer);
    activeClearTimer = null;
  }
  if (window.vaultDesktop?.cancelClearClipboard) {
    try {
      window.vaultDesktop.cancelClearClipboard();
    } catch {
      // Ignore
    }
  }
  pendingPurgeDueTimestamp = null;

  const delaySeconds =
    customDelaySeconds !== undefined ? customDelaySeconds : getClipboardClearDelay();

  if (delaySeconds <= 0) {
    onNotify?.(`${label} copied to clipboard`);
    return true;
  }

  onNotify?.(`${label} copied (auto-clears in ${delaySeconds}s)`);

  const onPurged = () => {
    onNotify?.("Security: Clipboard automatically purged.");
  };

  onPurgedCallbacks.add(onPurged);

  // 1. Electron Main Process background timer (OS level, unaffected by tab backgrounding)
  if (window.vaultDesktop?.scheduleClearClipboard) {
    try {
      window.vaultDesktop.scheduleClearClipboard(delaySeconds * 1000);
    } catch {
      // Ignore
    }
  }

  // 2. In-memory timer for renderer / web browser
  pendingPurgeDueTimestamp = Date.now() + delaySeconds * 1000;
  activeClearTimer = setTimeout(async () => {
    pendingPurgeDueTimestamp = null;
    activeClearTimer = null;
    await clearClipboardSafely();
    onPurgedCallbacks.forEach((cb) => {
      try {
        cb();
      } catch {
        // Ignore
      }
    });
    onPurgedCallbacks.clear();
  }, delaySeconds * 1000);

  return true;
}
