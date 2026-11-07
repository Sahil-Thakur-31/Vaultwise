"use client";

import { useCallback, useEffect } from "react";
import { ThemeMode } from "@/types/vault";
import { STORAGE_KEYS } from "@/lib/constants";
import { useLocalStorage } from "./useLocalStorage";

export function useTheme() {
  const [theme, setThemeState] = useLocalStorage<ThemeMode>(
    STORAGE_KEYS.THEME,
    "dark"
  );

  const applyTheme = useCallback((mode: ThemeMode) => {
    if (typeof document === "undefined") return;

    let effectiveTheme = mode;
    if (mode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effectiveTheme = prefersDark ? "dark" : "light";
    }

    document.documentElement.setAttribute("data-theme", effectiveTheme);
    if (effectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      applyTheme(newTheme);
    },
    [setThemeState, applyTheme]
  );

  return {
    theme,
    setTheme,
  };
}
