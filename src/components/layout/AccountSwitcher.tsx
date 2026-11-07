"use client";

import { useEffect, useRef } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { VaultScope } from "@/types/vault";

interface AccountSwitcherProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  activeAccount: string;
  scope: VaultScope;
  onSelectAccount: (account: string, scope: VaultScope) => void;
  onAddAccount: () => void;
}

export function AccountSwitcher({
  isOpen,
  onToggle,
  onClose,
  activeAccount,
  scope,
  onSelectAccount,
  onAddAccount,
}: AccountSwitcherProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div className="relative mb-3" ref={containerRef}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-left hover:border-slate-700 hover:bg-slate-800/60 transition"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="grid size-6 place-items-center rounded bg-slate-800 text-[10px] font-bold text-slate-300">
            {scope === "personal" ? "SK" : "NS"}
          </div>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-xs font-medium text-slate-200">
              {activeAccount}
            </b>
            <small className="block truncate text-[10px] text-slate-400 capitalize">
              {scope === "personal" ? "Personal Vault" : "Organization"}
            </small>
          </div>
        </div>
        <ChevronDown
          className={`size-3.5 text-slate-500 transition-transform ${
            isOpen ? "rotate-180 text-slate-300" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-12 z-40 w-56 rounded-lg border border-slate-700 bg-slate-900 p-1 text-slate-200 shadow-xl">
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Switch Vault
          </div>

          <button
            type="button"
            onClick={() => onSelectAccount("Sahil Kumar", "personal")}
            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-slate-800 ${
              scope === "personal" ? "bg-slate-800/80 text-white font-medium" : "text-slate-300"
            }`}
          >
            <span>Sahil Kumar (Personal)</span>
            {scope === "personal" && <Check className="size-3.5 text-blue-400" />}
          </button>

          <button
            type="button"
            onClick={() => onSelectAccount("Northstar Studio", "organization")}
            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-slate-800 ${
              scope === "organization" ? "bg-slate-800/80 text-white font-medium" : "text-slate-300"
            }`}
          >
            <span>Northstar Studio</span>
            {scope === "organization" && <Check className="size-3.5 text-blue-400" />}
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            type="button"
            onClick={onAddAccount}
            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <Plus className="size-3" />
            Add Account...
          </button>
        </div>
      )}
    </div>
  );
}
