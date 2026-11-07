"use client";

import { ReactNode } from "react";
import {
  CreditCard,
  FileText,
  FolderOpen,
  KeyRound,
  Plus,
  Search,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { FilterCategory } from "@/types/vault";

interface EmptyStateProps {
  type: "search" | "folder" | "favorites" | "trash" | FilterCategory;
  searchQuery?: string;
  folderName?: string;
  onClearSearch?: () => void;
  onAddNewItem?: () => void;
  onManageFolder?: () => void;
  customAction?: ReactNode;
}

export function EmptyState({
  type,
  searchQuery,
  folderName,
  onClearSearch,
  onAddNewItem,
  onManageFolder,
  customAction,
}: EmptyStateProps) {
  if (type === "search") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="grid size-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-3 shadow-sm">
          <Search className="size-5" />
        </div>
        <h4 className="text-xs font-bold text-[var(--text-primary)]">
          No Results Found
        </h4>
        <p className="mt-1 text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
          No credentials or tags matched &ldquo;<span className="text-[var(--text-secondary)] font-mono">{searchQuery}</span>&rdquo;.
        </p>
        <div className="mt-4 flex items-center gap-2">
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-app)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500 transition cursor-pointer"
            >
              Clear Search
            </button>
          )}
          {onAddNewItem && (
            <button
              type="button"
              onClick={onAddNewItem}
              className="flex items-center gap-1 rounded-md bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-3" />
              Create Item
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === "folder") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="grid size-12 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3 shadow-sm">
          <FolderOpen className="size-5" />
        </div>
        <h4 className="text-xs font-bold text-[var(--text-primary)]">
          {folderName ? `Folder "${folderName}" is Empty` : "Folder is Empty"}
        </h4>
        <p className="mt-1 text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
          There are currently no logins or items organized inside this folder.
        </p>
        <div className="mt-4 flex items-center gap-2">
          {onManageFolder && (
            <button
              type="button"
              onClick={onManageFolder}
              className="rounded-md border border-blue-500/30 bg-blue-600/10 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-600/20 transition cursor-pointer"
            >
              Add Multiple Items
            </button>
          )}
          {onAddNewItem && (
            <button
              type="button"
              onClick={onAddNewItem}
              className="flex items-center gap-1 rounded-md bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-3" />
              New in Folder
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === "favorites") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3 shadow-sm">
          <Star className="size-5 fill-amber-500/30" />
        </div>
        <h4 className="text-xs font-bold text-[var(--text-primary)]">
          No Favorites Pinned
        </h4>
        <p className="mt-1 text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
          Click the star icon on any credential or item to quickly pin it to your favorites.
        </p>
      </div>
    );
  }

  if (type === "trash") {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 shadow-sm">
          <Sparkles className="size-5" />
        </div>
        <h4 className="text-xs font-bold text-[var(--text-primary)]">
          Trash is Empty
        </h4>
        <p className="mt-1 text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
          No deleted items are in the trash bin. Deleted items will appear here before permanent purging.
        </p>
      </div>
    );
  }

  // Category specific empty states
  const icons: Record<string, ReactNode> = {
    Login: <KeyRound className="size-5 text-blue-500" />,
    Card: <CreditCard className="size-5 text-emerald-500" />,
    Identity: <User className="size-5 text-purple-500" />,
    "Secure note": <FileText className="size-5 text-amber-500" />,
    all: <KeyRound className="size-5 text-blue-500" />,
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="grid size-12 place-items-center rounded-2xl bg-[var(--bg-app)] border border-[var(--border-subtle)] mb-3 shadow-sm">
        {icons[type] || <KeyRound className="size-5 text-blue-500" />}
      </div>
      <h4 className="text-xs font-bold text-[var(--text-primary)]">
        No {type === "all" ? "Items" : type} Found
      </h4>
      <p className="mt-1 text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
        Your vault does not have any items stored in this category yet.
      </p>
      {onAddNewItem && (
        <button
          type="button"
          onClick={onAddNewItem}
          className="mt-4 flex items-center gap-1 rounded-md bg-[var(--accent-primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:opacity-90 transition active:scale-95 cursor-pointer"
        >
          <Plus className="size-3" />
          Create First {type === "all" ? "Item" : type}
        </button>
      )}
      {customAction}
    </div>
  );
}
