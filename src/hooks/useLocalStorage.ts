import { useCallback, useSyncExternalStore } from "react";

// In-memory cache to guarantee referential equality of getSnapshot
const snapshotCache = new Map<string, { raw: string | null; parsed: unknown }>();

function getSnapshot<T>(key: string, initialValue: T, fallbackKey?: string): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  let raw = window.localStorage.getItem(key);
  if (raw === null && fallbackKey) {
    raw = window.localStorage.getItem(fallbackKey);
  }

  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) {
    return cached.parsed as T;
  }

  if (raw === null) {
    snapshotCache.set(key, { raw: null, parsed: initialValue });
    return initialValue;
  }

  try {
    const parsed = JSON.parse(raw);
    snapshotCache.set(key, { raw, parsed });
    return parsed as T;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error);
    snapshotCache.set(key, { raw, parsed: initialValue });
    return initialValue;
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", callback);
  window.addEventListener("vaultwise-storage-event", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("vaultwise-storage-event", callback);
  };
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  fallbackKey?: string
): [T, (action: T | ((prev: T) => T)) => void] {
  const getClientSnapshot = useCallback(() => {
    return getSnapshot<T>(key, initialValue, fallbackKey);
  }, [key, initialValue, fallbackKey]);

  const getServerSnapshot = useCallback(() => {
    return initialValue;
  }, [initialValue]);

  const value = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (action: T | ((prev: T) => T)) => {
      if (typeof window === "undefined") return;

      const current = getSnapshot<T>(key, initialValue, fallbackKey);
      const nextValue = typeof action === "function" ? (action as (prev: T) => T)(current) : action;
      const raw = JSON.stringify(nextValue);

      try {
        window.localStorage.setItem(key, raw);
      } catch (err) {
        console.warn(`Local storage write failed for "${key}". Falling back to memory state:`, err);
      }
      snapshotCache.set(key, { raw, parsed: nextValue });
      window.dispatchEvent(new Event("vaultwise-storage-event"));
    },
    [key, initialValue, fallbackKey]
  );

  return [value, setValue];
}
