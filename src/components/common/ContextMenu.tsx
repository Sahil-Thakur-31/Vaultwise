"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useContextMenu } from "@/context/ContextMenuContext";
import { ContextMenuEntry, ContextMenuItemAction } from "@/types/contextMenu";

export function ContextMenu() {
  const { state, closeContextMenu } = useContextMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState<{ x: number; y: number }>({
    x: state.x,
    y: state.y,
  });
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);

  // Smart boundary collision positioning
  useEffect(() => {
    if (!state.isOpen) {
      return;
    }

    const updatePosition = () => {
      const menuEl = menuRef.current;
      if (!menuEl) return;

      const rect = menuEl.getBoundingClientRect();
      const menuWidth = rect.width || 230;
      const menuHeight = rect.height || 260;
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      let newX = state.x;
      let newY = state.y;

      // Flip left if overflowing right
      if (newX + menuWidth > winWidth - 10) {
        newX = Math.max(10, winWidth - menuWidth - 12);
      }

      // Flip up if overflowing bottom
      if (newY + menuHeight > winHeight - 10) {
        newY = Math.max(10, winHeight - menuHeight - 12);
      }

      setAdjustedPos({ x: newX, y: newY });
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(updatePosition);
  }, [state.isOpen, state.x, state.y, state.items]);

  if (!state.isOpen || state.items.length === 0) return null;

  return (
    <div
      ref={menuRef}
      style={{
        left: `${adjustedPos.x}px`,
        top: `${adjustedPos.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      className="fixed z-50 min-w-[210px] max-w-[280px] rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)]/95 backdrop-blur-md p-1.5 shadow-2xl text-xs text-[var(--text-primary)] select-none animate-scale-in transition-all"
    >
      {/* Optional Context Menu Header */}
      {(state.title || state.subtitle) && (
        <div className="px-2.5 py-1.5 mb-1 border-b border-[var(--border-subtle)]">
          {state.title && (
            <div className="font-bold text-[11px] text-[var(--text-primary)] truncate">
              {state.title}
            </div>
          )}
          {state.subtitle && (
            <div className="text-[10px] text-[var(--text-muted)] truncate font-mono">
              {state.subtitle}
            </div>
          )}
        </div>
      )}

      {/* Menu Entries */}
      <div className="space-y-0.5">
        {state.items.map((entry, idx) => {
          if (entry.type === "divider") {
            return (
              <div key={entry.id || `div-${idx}`} className="my-1 px-2 pt-1 border-t border-[var(--border-subtle)]">
                {entry.label && (
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                    {entry.label}
                  </span>
                )}
              </div>
            );
          }

          const action = entry as ContextMenuItemAction;
          const hasSubmenu = Boolean(action.submenu && action.submenu.length > 0);
          const isSubmenuOpen = activeSubmenuId === action.id;
          const Icon = action.icon;

          return (
            <div
              key={action.id}
              className="relative"
              onMouseEnter={() => {
                if (hasSubmenu) {
                  setActiveSubmenuId(action.id);
                } else {
                  setActiveSubmenuId(null);
                }
              }}
            >
              <button
                type="button"
                disabled={action.disabled}
                onClick={() => {
                  if (action.disabled) return;
                  if (hasSubmenu) {
                    setActiveSubmenuId((prev) => (prev === action.id ? null : action.id));
                    return;
                  }
                  closeContextMenu();
                  action.onClick?.();
                }}
                className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition cursor-pointer ${
                  action.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : action.danger
                    ? "text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                    : isSubmenuOpen
                    ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-semibold"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                <span className="flex items-center gap-2 truncate flex-1">
                  {Icon && (
                    <Icon
                      className={`size-3.5 shrink-0 ${
                        action.danger
                          ? "text-rose-500"
                          : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                      }`}
                    />
                  )}
                  <span className="truncate">{action.label}</span>
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  {action.badge && (
                    <span className="rounded bg-[var(--bg-app)] px-1.5 py-0.2 text-[9px] font-mono font-semibold text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {action.badge}
                    </span>
                  )}
                  {action.shortcut && (
                    <kbd className="font-mono text-[10px] text-[var(--text-muted)]">
                      {action.shortcut}
                    </kbd>
                  )}
                  {hasSubmenu && <ChevronRight className="size-3 text-[var(--text-muted)]" />}
                </div>
              </button>

              {/* Nested Submenu */}
              {hasSubmenu && isSubmenuOpen && action.submenu && (
                <SubmenuDropdown
                  items={action.submenu}
                  parentX={adjustedPos.x}
                  onClose={closeContextMenu}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubmenuDropdown({
  items,
  parentX,
  onClose,
}: {
  items: ContextMenuEntry[];
  parentX: number;
  onClose: () => void;
}) {
  const submenuRef = useRef<HTMLDivElement>(null);
  const [flipLeft, setFlipLeft] = useState(false);

  useEffect(() => {
    const el = submenuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.right > window.innerWidth - 10) {
      setFlipLeft(true);
    }
  }, [parentX]);

  return (
    <div
      ref={submenuRef}
      className={`absolute top-0 z-50 min-w-[190px] max-w-[260px] rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)]/95 backdrop-blur-md p-1.5 shadow-2xl animate-scale-in ${
        flipLeft ? "right-full mr-1" : "left-full ml-1"
      }`}
    >
      <div className="space-y-0.5">
        {items.map((entry, idx) => {
          if (entry.type === "divider") {
            return (
              <div key={entry.id || `subdiv-${idx}`} className="my-1 px-2 pt-1 border-t border-[var(--border-subtle)]">
                {entry.label && (
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                    {entry.label}
                  </span>
                )}
              </div>
            );
          }

          const action = entry as ContextMenuItemAction;
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              type="button"
              disabled={action.disabled}
              onClick={() => {
                if (action.disabled) return;
                onClose();
                action.onClick?.();
              }}
              className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition cursor-pointer ${
                action.disabled
                  ? "opacity-40 cursor-not-allowed"
                  : action.danger
                  ? "text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              <span className="flex items-center gap-2 truncate flex-1">
                {Icon && (
                  <Icon
                    className={`size-3.5 shrink-0 ${
                      action.danger ? "text-rose-500" : "text-[var(--text-muted)]"
                    }`}
                  />
                )}
                <span className="truncate">{action.label}</span>
              </span>

              {action.shortcut && (
                <kbd className="font-mono text-[10px] text-[var(--text-muted)]">
                  {action.shortcut}
                </kbd>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

