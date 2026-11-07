"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ContextMenuEntry, ContextMenuState } from "@/types/contextMenu";

interface ContextMenuContextValue {
  state: ContextMenuState;
  openContextMenu: (
    e: React.MouseEvent | MouseEvent,
    items: ContextMenuEntry[],
    options?: { title?: string; subtitle?: string }
  ) => void;
  closeContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export function ContextMenuProvider({
  children,
  globalFallbackItems,
}: {
  children: React.ReactNode;
  globalFallbackItems?: () => ContextMenuEntry[];
}) {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  });

  const closeContextMenu = useCallback(() => {
    setState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  const openContextMenu = useCallback(
    (
      e: React.MouseEvent | MouseEvent,
      items: ContextMenuEntry[],
      options?: { title?: string; subtitle?: string }
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const x = e.clientX;
      const y = e.clientY;

      setState({
        isOpen: true,
        x,
        y,
        title: options?.title,
        subtitle: options?.subtitle,
        items,
      });
    },
    []
  );

  // Global listeners to close context menu and handle fallback
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Left click outside closes menu
      if (e.button === 0) {
        closeContextMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeContextMenu();
      }
    };

    const handleScrollOrResize = () => {
      closeContextMenu();
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      // If default was not prevented by child element, show global fallback menu!
      if (!e.defaultPrevented && globalFallbackItems) {
        e.preventDefault();
        const items = globalFallbackItems();
        if (items && items.length > 0) {
          openContextMenu(e, items, {
            title: "Vaultwise",
            subtitle: "Global Workspace",
          });
        }
      }
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("contextmenu", handleGlobalContextMenu);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("contextmenu", handleGlobalContextMenu);
    };
  }, [closeContextMenu, globalFallbackItems, openContextMenu]);

  return (
    <ContextMenuContext.Provider
      value={{
        state,
        openContextMenu,
        closeContextMenu,
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) {
    throw new Error("useContextMenu must be used within a ContextMenuProvider");
  }
  return ctx;
}

