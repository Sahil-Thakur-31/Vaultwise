"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  KeyRound,
  Lock,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { FilterCategory, Folder, Member, VaultScope, ViewType } from "@/types/vault";
import { AccountSwitcher } from "./AccountSwitcher";
import { useContextMenu } from "@/context/ContextMenuContext";
import { buildFolderContextMenu } from "@/lib/contextMenuBuilders";

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  category: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  counts: {
    all: number;
    Login: number;
    Card: number;
    Identity: number;
    "Secure note": number;
    favorites: number;
    trash: number;
  };
  scope: VaultScope;
  activeAccount: string;
  isAccountSwitcherOpen: boolean;
  onToggleAccountSwitcher: () => void;
  onCloseAccountSwitcher: () => void;
  onSelectAccount: (account: string, scope: VaultScope) => void;
  members: Member[];
  onAddNewItem: () => void;
  onLockVault: () => void;
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onOpenManageFolder?: (folder: Folder) => void;
  onAddNewItemToFolder?: (folderId: string) => void;
  onRenameFolder?: (folder: Folder) => void;
  folderItemCounts: Record<string, number>;
  activeSendCount: number;
  onNotify: (msg: string) => void;
}

export function Sidebar({
  currentView,
  onSelectView,
  category,
  onSelectCategory,
  counts,
  scope,
  activeAccount,
  isAccountSwitcherOpen,
  onToggleAccountSwitcher,
  onCloseAccountSwitcher,
  onSelectAccount,
  members,
  onAddNewItem,
  onLockVault,
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  onOpenManageFolder,
  onAddNewItemToFolder,
  onRenameFolder,
  folderItemCounts,
  activeSendCount,
  onNotify,
}: SidebarProps) {
  const { openContextMenu } = useContextMenu();
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isVaultItemsOpen, setIsVaultItemsOpen] = useState(true);
  const [isFoldersOpen, setIsFoldersOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(true);
  const [folderFilter, setFolderFilter] = useState("");

  const handleFolderContextMenu = (e: React.MouseEvent, f: Folder) => {
    e.preventDefault();
    e.stopPropagation();

    const entries = buildFolderContextMenu({
      folder: f,
      onAddNewItemToFolder: (folderId) => onAddNewItemToFolder?.(folderId),
      onManageFolderItems: (folder) => onOpenManageFolder?.(folder),
      onSelectFolder: (folderId) => {
        onSelectFolder(folderId);
        onSelectView("vault");
      },
      onRenameFolder,
      onDeleteFolder: (folderId) => {
        onDeleteFolder(folderId);
        if (selectedFolderId === folderId) onSelectFolder(null);
      },
      onNotify,
    });

    openContextMenu(e, entries, {
      title: f.name,
      subtitle: "Folder Collection",
    });
  };

  const categoryItems: Array<{
    id: FilterCategory;
    icon: typeof Shield;
    label: string;
    count: number;
  }> = [
    { id: "all", icon: Shield, label: "All Items", count: counts.all },
    { id: "Login", icon: KeyRound, label: "Logins", count: counts.Login },
    { id: "Card", icon: CreditCard, label: "Payment Cards", count: counts.Card },
    { id: "Identity", icon: UserCheck, label: "Identities", count: counts.Identity },
    { id: "Secure note", icon: FileText, label: "Secure Notes", count: counts["Secure note"] },
    { id: "favorites", icon: Star, label: "Favorites", count: counts.favorites },
    { id: "trash", icon: Trash2, label: "Trash", count: counts.trash },
  ];

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onAddFolder(newFolderName.trim());
    setNewFolderName("");
    setIsAddingFolder(false);
    onNotify(`Folder "${newFolderName.trim()}" created`);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[var(--bg-sidebar)] px-3 py-4 text-slate-300 border-r border-[var(--border-subtle)] select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Lock className="size-3.5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block leading-tight">
              Vaultwise
            </span>
            <span className="text-[10px] font-mono text-slate-400">Desktop Pro</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLockVault}
          className="rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          title="Lock vault immediately (⌘L)"
        >
          Lock
        </button>
      </div>

      {/* Account / Workspace Switcher */}
      <AccountSwitcher
        isOpen={isAccountSwitcherOpen}
        onToggle={onToggleAccountSwitcher}
        onClose={onCloseAccountSwitcher}
        activeAccount={activeAccount}
        scope={scope}
        onSelectAccount={onSelectAccount}
        onAddAccount={() => {
          onCloseAccountSwitcher();
          onNotify("Organization sync settings available in enterprise plan");
        }}
      />

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onAddNewItem}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] cursor-pointer"
      >
        <Plus className="size-3.5" />
        New Item
        <kbd className="ml-auto rounded bg-blue-700/80 px-1.5 py-0.2 text-[10px] font-mono text-blue-200">
          ⌘ N
        </kbd>
      </button>

      {/* Categories, Folders, & Tools Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {/* VAULT ITEMS */}
        <div>
          <button
            type="button"
            onClick={() => setIsVaultItemsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-200 transition cursor-pointer"
          >
            <span>Vault Items</span>
            {isVaultItemsOpen ? (
              <ChevronDown className="size-3 text-slate-400" />
            ) : (
              <ChevronRight className="size-3 text-slate-400" />
            )}
          </button>
          {isVaultItemsOpen && (
            <div className="space-y-0.5">
              {categoryItems.map((item) => {
                const isSelected =
                  currentView === "vault" &&
                  selectedFolderId === null &&
                  category === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectFolder(null);
                      onSelectCategory(item.id);
                      onSelectView("vault");
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openContextMenu(
                        e,
                        [
                          {
                            id: "view-cat",
                            label: `View ${item.label}`,
                            icon: item.icon,
                            onClick: () => {
                              onSelectFolder(null);
                              onSelectCategory(item.id);
                              onSelectView("vault");
                            },
                          },
                          {
                            id: "new-item",
                            label: "New Vault Item",
                            icon: Plus,
                            shortcut: "⌘N",
                            onClick: onAddNewItem,
                          },
                          { type: "divider" },
                          {
                            id: "lock-vault",
                            label: "Lock Vault",
                            icon: Lock,
                            shortcut: "⌘L",
                            onClick: onLockVault,
                          },
                        ],
                        { title: item.label, subtitle: `${item.count} items` }
                      );
                    }}
                    className={`group flex h-7.5 w-full items-center justify-between rounded-lg px-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-white font-semibold border-l-2 border-blue-500 shadow-2xs"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:translate-x-0.5 border-l-2 border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`size-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                          item.id === "trash"
                            ? "text-rose-400"
                            : isSelected
                            ? "text-blue-400"
                            : "text-slate-400 group-hover:text-blue-400"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span
                      className={`text-[11px] font-mono shrink-0 transition-opacity ${
                        isSelected ? "text-slate-200 font-bold" : "text-slate-400 group-hover:text-slate-300"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* VAULT FOLDERS */}
        <div>
          <div className="flex items-center justify-between px-2.5 pb-1">
            <button
              type="button"
              onClick={() => setIsFoldersOpen((prev) => !prev)}
              className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-200 transition cursor-pointer"
            >
              <span>Folders</span>
              {isFoldersOpen ? (
                <ChevronDown className="size-3 text-slate-400" />
              ) : (
                <ChevronRight className="size-3 text-slate-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFoldersOpen(true);
                setIsAddingFolder((prev) => !prev);
              }}
              className="text-slate-400 hover:text-slate-200 transition p-0.5 rounded cursor-pointer"
              title="Add New Folder"
            >
              <Plus className="size-3" />
            </button>
          </div>

          {isFoldersOpen && (
            <>
              {/* Folder Search Filter (Visible if more than 2 folders) */}
              {folders.length > 2 && (
                <div className="px-2 pb-1.5">
                  <div className="flex items-center gap-1.5 rounded border border-slate-700/60 bg-slate-900/60 px-2 py-0.5 text-slate-400 focus-within:border-blue-500">
                    <Search className="size-2.5 shrink-0 text-slate-400" />
                    <input
                      value={folderFilter}
                      onChange={(e) => setFolderFilter(e.target.value)}
                      placeholder="Filter folders..."
                      className="w-full bg-transparent text-[11px] text-slate-200 placeholder-slate-400 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Inline Add Folder Input */}
              {isAddingFolder && (
                <form onSubmit={handleCreateFolder} className="px-2 pb-2">
                  <input
                    type="text"
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name..."
                    className="w-full rounded border border-slate-700 bg-slate-900/90 px-2 py-1 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500"
                    onBlur={() => {
                      if (!newFolderName.trim()) setIsAddingFolder(false);
                    }}
                  />
                </form>
              )}

              <div className="space-y-0.5">
                {folders
                  .filter((f) => f.name.toLowerCase().includes(folderFilter.toLowerCase()))
                  .map((f) => {
                    const isSelected =
                      currentView === "vault" && selectedFolderId === f.id;
                    const count = folderItemCounts[f.id] || 0;
                    return (
                      <div
                        key={f.id}
                        onContextMenu={(e) => handleFolderContextMenu(e, f)}
                        className={`group flex h-7.5 w-full items-center justify-between rounded-lg px-2.5 text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-slate-800 text-white font-semibold border-l-2 border-blue-500"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-2 border-transparent"
                        }`}
                        onClick={() => {
                          onSelectFolder(isSelected ? null : f.id);
                          onSelectView("vault");
                        }}
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          {isSelected ? (
                            <FolderOpen className="size-3.5 text-blue-400 shrink-0" />
                          ) : (
                            <FolderIcon className="size-3.5 text-slate-400 group-hover:text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{f.name}</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`text-[11px] font-mono mr-1 ${
                              isSelected ? "text-slate-300" : "text-slate-400"
                            }`}
                          >
                            {count}
                          </span>
                          {onAddNewItemToFolder && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddNewItemToFolder(f.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                              title="Add item directly to this folder"
                            >
                              <Plus className="size-3" />
                            </button>
                          )}
                          {onOpenManageFolder && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenManageFolder(f);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-400 transition cursor-pointer"
                              title="Manage items in this folder"
                            >
                              <FolderPlus className="size-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete folder "${f.name}"?`)) {
                                onDeleteFolder(f.id);
                                if (selectedFolderId === f.id) onSelectFolder(null);
                                onNotify(`Folder "${f.name}" deleted`);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Delete folder"
                          >
                            <Trash2 className="size-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {folders.length === 0 && !isAddingFolder && (
                  <div className="px-2.5 py-1 text-[11px] text-slate-400 italic">
                    No folders created.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* SECURITY TOOLS & SUITE */}
        <div>
          <button
            type="button"
            onClick={() => setIsToolsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between px-2.5 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase hover:text-slate-200 transition cursor-pointer"
          >
            <span>Security & Tools</span>
            {isToolsOpen ? (
              <ChevronDown className="size-3 text-slate-400" />
            ) : (
              <ChevronRight className="size-3 text-slate-400" />
            )}
          </button>
          {isToolsOpen && (
            <div className="space-y-0.5">
              {/* Vaultwise Send */}
              <button
                type="button"
                onClick={() => onSelectView("send")}
                className={`group flex h-7.5 w-full items-center justify-between rounded-lg px-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                  currentView === "send"
                    ? "bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-white font-semibold border-l-2 border-blue-500 shadow-2xs"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:translate-x-0.5 border-l-2 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Send
                    className={`size-3.5 transition-transform group-hover:scale-110 ${
                      currentView === "send" ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                    }`}
                  />
                  Vaultwise Send
                </span>
                {activeSendCount > 0 && (
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-blue-300">
                    {activeSendCount}
                  </span>
                )}
              </button>

              {/* Generator Suite */}
              <button
                type="button"
                onClick={() => onSelectView("generator")}
                className={`group flex h-7.5 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                  currentView === "generator"
                    ? "bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-white font-semibold border-l-2 border-blue-500 shadow-2xs"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:translate-x-0.5 border-l-2 border-transparent"
                }`}
              >
                <KeyRound
                  className={`size-3.5 transition-transform group-hover:scale-110 ${
                    currentView === "generator" ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                  }`}
                />
                Generator Suite
              </button>

              {/* Security Reports */}
              <button
                type="button"
                onClick={() => onSelectView("reports")}
                className={`group flex h-7.5 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                  currentView === "reports"
                    ? "bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-white font-semibold border-l-2 border-blue-500 shadow-2xs"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:translate-x-0.5 border-l-2 border-transparent"
                }`}
              >
                <ShieldCheck
                  className={`size-3.5 transition-transform group-hover:scale-110 ${
                    currentView === "reports" ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                  }`}
                />
                Security Reports
              </button>

              {/* Tools & Migration */}
              <button
                type="button"
                onClick={() => onSelectView("tools")}
                className={`group flex h-7.5 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                  currentView === "tools"
                    ? "bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-white font-semibold border-l-2 border-blue-500 shadow-2xs"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:translate-x-0.5 border-l-2 border-transparent"
                }`}
              >
                <Wrench
                  className={`size-3.5 transition-transform group-hover:scale-110 ${
                    currentView === "tools" ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                  }`}
                />
                Tools & Migration
              </button>

              {/* Organization Team Seats */}
              {scope === "organization" && (
                <button
                  type="button"
                  onClick={() => onSelectView("members")}
                  className={`group flex h-7.5 w-full items-center justify-between rounded-lg px-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                    currentView === "members"
                      ? "bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-white font-semibold border-l-2 border-blue-500 shadow-2xs"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:translate-x-0.5 border-l-2 border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users
                      className={`size-3.5 transition-transform group-hover:scale-110 ${
                        currentView === "members" ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                      }`}
                    />
                    Team Seats
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {members.length}/10
                  </span>
                </button>
              )}

              {/* Settings & Preferences */}
              <button
                type="button"
                onClick={() => onSelectView("settings")}
                className={`group flex h-7.5 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                  currentView === "settings"
                    ? "bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-white font-semibold border-l-2 border-blue-500 shadow-2xs"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 hover:translate-x-0.5 border-l-2 border-transparent"
                }`}
              >
                <Settings
                  className={`size-3.5 transition-transform group-hover:scale-110 ${
                    currentView === "settings" ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                  }`}
                />
                Vault Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/80 pt-3 px-1 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            AES-256 GCM
          </span>
          <span className="font-mono text-[10px] text-slate-400">v2.4.0 Vaultwise Core</span>
        </div>
      </div>
    </aside>
  );
}
