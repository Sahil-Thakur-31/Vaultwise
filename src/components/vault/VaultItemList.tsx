"use client";

import { useMemo, useState } from "react";
import {
  AlignJustify,
  ArrowUpDown,
  Check,
  Copy,
  FolderOpen,
  FolderPlus,
  KeyRound,
  Plus,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { FilterCategory, Folder as FolderType, SortOption, UiDensity, VaultItem } from "@/types/vault";
import { ItemLogo } from "./ItemLogo";
import { EmptyState } from "../common/EmptyState";
import { VaultListSkeleton } from "../common/SkeletonLoader";
import { useContextMenu } from "@/context/ContextMenuContext";
import {
  buildFolderContextMenu,
  buildListBackgroundContextMenu,
  buildVaultItemContextMenu,
} from "@/lib/contextMenuBuilders";
import { copySensitiveText, copyTextSafely } from "@/lib/clipboard";

interface VaultItemListProps {
  items: VaultItem[];
  selectedItemId: number | null;
  onSelectItem: (id: number) => void;
  category: FilterCategory;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onToggleFavorite: (id: number) => void;
  availableTags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onEmptyTrash?: () => void;
  folders?: FolderType[];
  selectedFolderId?: string | null;
  onOpenManageFolder?: (folder: FolderType) => void;
  onMoveItemsToFolder?: (itemIds: number[], folderId: string | null) => void;
  onBatchTrashItems?: (itemIds: number[]) => void;
  onBatchFavoriteItems?: (itemIds: number[], favorite: boolean) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
  onAddNewItem?: (folderId?: string) => void;
  onDuplicateItem?: (id: number) => void;
  onTrashItem?: (id: number) => void;
  onRestoreItem?: (id: number) => void;
  onDeletePermanently?: (id: number) => void;
  onCreateFolderPrompt?: () => void;
  onRenameFolder?: (folder: FolderType) => void;
  onDeleteFolder?: (id: string) => void;
  onLockVault?: () => void;
  onNotify?: (msg: string) => void;
  density?: UiDensity;
  onToggleDensity?: () => void;
}

export function VaultItemList({
  items,
  selectedItemId,
  onSelectItem,
  category,
  sortOption,
  onSortChange,
  onToggleFavorite,
  availableTags,
  selectedTag,
  onSelectTag,
  onEmptyTrash,
  folders = [],
  selectedFolderId = null,
  onOpenManageFolder,
  onMoveItemsToFolder,
  onBatchTrashItems,
  onBatchFavoriteItems,
  isLoading = false,
  searchQuery = "",
  onClearSearch,
  onAddNewItem,
  onDuplicateItem,
  onTrashItem,
  onRestoreItem,
  onDeletePermanently,
  onCreateFolderPrompt,
  onRenameFolder,
  onDeleteFolder,
  onLockVault,
  onNotify,
  density = "comfortable",
  onToggleDensity,
}: VaultItemListProps) {
  const { openContextMenu } = useContextMenu();
  const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [copiedField, setCopiedField] = useState<{ id: number; field: "user" | "pass" } | null>(null);

  const handleQuickCopyUser = async (e: React.MouseEvent, item: VaultItem) => {
    e.stopPropagation();
    if (!item.username) return;
    const ok = await copyTextSafely(item.username);
    if (ok) {
      setCopiedField({ id: item.id, field: "user" });
      onNotify?.("Username copied to clipboard");
      setTimeout(() => setCopiedField(null), 1500);
    }
  };

  const handleQuickCopyPass = async (e: React.MouseEvent, item: VaultItem) => {
    e.stopPropagation();
    if (!item.password) return;
    const ok = await copySensitiveText(item.password, "Password", undefined, onNotify);
    if (ok) {
      setCopiedField({ id: item.id, field: "pass" });
      setTimeout(() => setCopiedField(null), 1500);
    }
  };

  const categoryTitles: Record<FilterCategory, string> = {
    all: "All Items",
    Login: "Logins",
    Card: "Payment Cards",
    Identity: "Identities",
    "Secure note": "Secure Notes",
    favorites: "Favorites",
    trash: "Trash & Deleted",
  };

  const isTrashView = category === "trash";

  const activeFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  const toggleBatchSelect = (id: number) => {
    setSelectedBatchIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBatchIds.length === items.length) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(items.map((i) => i.id));
    }
  };

  const handleMoveBatch = (folderId: string | null) => {
    if (selectedBatchIds.length === 0 || !onMoveItemsToFolder) return;
    onMoveItemsToFolder(selectedBatchIds, folderId);
    setSelectedBatchIds([]);
    setIsSelectMode(false);
  };

  const handleBatchTrash = () => {
    if (selectedBatchIds.length === 0 || !onBatchTrashItems) return;
    if (confirm(`Move ${selectedBatchIds.length} items to Trash?`)) {
      onBatchTrashItems(selectedBatchIds);
      setSelectedBatchIds([]);
      setIsSelectMode(false);
    }
  };

  const handleBatchFavorite = () => {
    if (selectedBatchIds.length === 0 || !onBatchFavoriteItems) return;
    onBatchFavoriteItems(selectedBatchIds, true);
    setSelectedBatchIds([]);
    setIsSelectMode(false);
  };

  const handleItemContextMenu = (e: React.MouseEvent, item: VaultItem) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectItem(item.id);

    const entries = buildVaultItemContextMenu({
      item,
      folders,
      isTrashView,
      onSelectItem,
      onEditItem: () => onSelectItem(item.id),
      onToggleFavorite,
      onDuplicateItem,
      onTrashItem,
      onRestoreItem,
      onDeletePermanently,
      onMoveToFolder: (itemId, folderId) => {
        onMoveItemsToFolder?.([itemId], folderId);
        onNotify?.(folderId ? "Item moved to folder" : "Item removed from folder");
      },
      onCreateFolderPrompt,
      onNotify: onNotify || (() => {}),
    });

    openContextMenu(e, entries, {
      title: item.name,
      subtitle: `${item.type} • ${item.username || "No username"}`,
    });
  };

  const handleFolderBannerContextMenu = (e: React.MouseEvent, folder: FolderType) => {
    e.preventDefault();
    e.stopPropagation();

    const entries = buildFolderContextMenu({
      folder,
      onAddNewItemToFolder: (fId) => onAddNewItem?.(fId),
      onManageFolderItems: (f) => onOpenManageFolder?.(f),
      onSelectFolder: () => {},
      onRenameFolder,
      onDeleteFolder: onDeleteFolder || (() => {}),
      onNotify: onNotify || (() => {}),
    });

    openContextMenu(e, entries, {
      title: folder.name,
      subtitle: "Folder Collection",
    });
  };

  const handleBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const entries = buildListBackgroundContextMenu({
      activeFolder,
      onAddNewItem: () => onAddNewItem?.(activeFolder?.id),
      onCreateFolder: onCreateFolderPrompt,
      onToggleSelectMode: () => {
        setIsSelectMode(true);
        setSelectedBatchIds(items.map((i) => i.id));
      },
      onSortChange,
      onLockVault: onLockVault || (() => {}),
    });

    openContextMenu(e, entries, {
      title: activeFolder ? activeFolder.name : "Vault Items",
      subtitle: `${items.length} items in view`,
    });
  };

  return (
    <div className="flex w-80 md:w-96 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-card)] shrink-0 select-none">
      {/* Active Folder Header Banner */}
      {activeFolder && (
        <div
          onContextMenu={(e) => handleFolderBannerContextMenu(e, activeFolder)}
          className="flex items-center justify-between bg-blue-600/10 px-4 py-2.5 border-b border-blue-500/20"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="size-4 text-blue-500 shrink-0" />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-blue-500 truncate">
                {activeFolder.name}
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                Folder Collection
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onAddNewItem && (
              <button
                type="button"
                onClick={() => onAddNewItem(activeFolder.id)}
                className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 transition shadow-2xs cursor-pointer"
                title="Add a new item to this folder"
              >
                <Plus className="size-3" />
                Add Item
              </button>
            )}
            {onOpenManageFolder && (
              <button
                type="button"
                onClick={() => onOpenManageFolder(activeFolder)}
                className="flex items-center gap-1 rounded border border-blue-500/30 bg-blue-600/20 px-2 py-1 text-[11px] font-semibold text-blue-400 hover:bg-blue-600/30 transition shrink-0 cursor-pointer shadow-2xs"
                title="Add or remove multiple items from this folder"
              >
                <FolderPlus className="size-3" />
                Manage
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pane Header */}
      <div className="flex h-12 items-center justify-between border-b border-[var(--border-subtle)] px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-[var(--text-primary)]">
            {activeFolder ? `Items in Folder` : categoryTitles[category]}
          </h2>
          <span className="rounded bg-[var(--bg-app)] px-1.5 py-0.2 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]">
            {items.length}
          </span>
        </div>

        {/* Multi-Select Toggle & Sort / Empty Trash */}
        <div className="flex items-center gap-2">
          {!isTrashView && items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsSelectMode((prev) => !prev);
                if (isSelectMode) setSelectedBatchIds([]);
              }}
              className={`rounded px-2 py-0.5 text-[10px] font-semibold transition cursor-pointer ${
                isSelectMode
                  ? "bg-blue-600 text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-app)]"
              }`}
              title="Toggle multi-item select mode"
            >
              {isSelectMode ? "Done" : "Select"}
            </button>
          )}

          {isTrashView && items.length > 0 && onEmptyTrash ? (
            <button
              type="button"
              onClick={onEmptyTrash}
              className="text-[11px] font-semibold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="size-3" />
              Empty
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <ArrowUpDown className="size-3" />
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent text-[11px] font-medium text-[var(--text-secondary)] outline-none cursor-pointer"
              >
                <option value="updated">Recent</option>
                <option value="name">Name A–Z</option>
                <option value="type">Type</option>
              </select>

              {onToggleDensity && (
                <button
                  type="button"
                  onClick={onToggleDensity}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)] transition cursor-pointer"
                  title={`Toggle density mode (Current: ${density})`}
                >
                  <AlignJustify className="size-3 text-blue-500" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tag Filter Chips (if tags available) */}
      {availableTags.length > 0 && !isTrashView && !activeFolder && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--border-subtle)] overflow-x-auto text-[10px]">
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={`rounded px-2 py-0.5 font-medium transition shrink-0 ${
              selectedTag === null
                ? "bg-[var(--accent-primary)] text-white"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-app)]"
            }`}
          >
            All
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
              className={`rounded px-2 py-0.5 font-medium transition shrink-0 flex items-center gap-1 ${
                selectedTag === tag
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--bg-app)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
              }`}
            >
              <Tag className="size-2.5 opacity-60" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Batch Action Toolbar when items are selected */}
      {selectedBatchIds.length > 0 && (
        <div className="flex flex-col gap-2 bg-blue-600/10 p-2.5 border-b border-blue-500/20 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-500 text-[11px]">
              {selectedBatchIds.length} item{selectedBatchIds.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] text-blue-400 hover:underline"
              >
                {selectedBatchIds.length === items.length ? "Deselect All" : "Select All"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedBatchIds([])}
                className="p-0.5 text-slate-400 hover:text-slate-200"
                title="Cancel selection"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Move to Folder Dropdown */}
            <select
              onChange={(e) => {
                if (!e.target.value) return;
                const folderId = e.target.value === "none" ? null : e.target.value;
                handleMoveBatch(folderId);
              }}
              defaultValue=""
              className="flex-1 rounded border border-blue-500/30 bg-[var(--bg-card)] px-2 py-1 text-[11px] text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value="" disabled>
                Move to Folder...
              </option>
              <option value="none">(Remove from folder)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleBatchFavorite}
              className="rounded border border-blue-500/30 bg-[var(--bg-card)] p-1 text-amber-500 hover:bg-[var(--bg-card-hover)]"
              title="Pin all selected to Favorites"
            >
              <Star className="size-3.5 fill-amber-500" />
            </button>

            <button
              type="button"
              onClick={handleBatchTrash}
              className="rounded border border-blue-500/30 bg-[var(--bg-card)] p-1 text-rose-500 hover:bg-[var(--bg-card-hover)]"
              title="Move selected to Trash"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Item List / Skeleton / Empty State */}
      <div
        className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]"
        onContextMenu={handleBackgroundContextMenu}
      >
        {isLoading ? (
          <VaultListSkeleton count={7} />
        ) : items.length > 0 ? (
          items.map((item, idx) => {
            const isSelected = item.id === selectedItemId;
            const isBatchChecked = selectedBatchIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isSelectMode) {
                    toggleBatchSelect(item.id);
                  } else {
                    onSelectItem(item.id);
                  }
                }}
                onContextMenu={(e) => handleItemContextMenu(e, item)}
                style={{ animationDelay: `${Math.min(idx * 30, 240)}ms` }}
                className={`group flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 animate-slide-up ${
                  density === "compact" ? "px-3 py-1.5" : "px-4 py-2.5"
                } ${
                  isBatchChecked
                    ? "bg-blue-600/15 border-l-[3px] border-blue-600 shadow-2xs"
                    : isSelected
                    ? "bg-[var(--accent-subtle)] border-l-[3px] border-[var(--accent-primary)] shadow-2xs"
                    : "hover:bg-[var(--bg-card-hover)] border-l-[3px] border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Batch Checkbox */}
                  {isSelectMode ? (
                    <input
                      type="checkbox"
                      checked={isBatchChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleBatchSelect(item.id);
                      }}
                      className="size-4 rounded accent-blue-600 cursor-pointer shrink-0"
                    />
                  ) : (
                    <ItemLogo item={item} size="sm" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <b
                        className={`truncate text-xs font-semibold ${
                          isSelected
                            ? "text-[var(--accent-primary)]"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {item.name}
                      </b>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.passkey && (
                          <span
                            title="FIDO2 Passkey Attached"
                            className="rounded bg-violet-500/10 px-1 py-0.2 text-[9px] font-mono font-bold text-violet-400 border border-violet-500/20"
                          >
                            Passkey
                          </span>
                        )}
                        {item.totpSecret && (
                          <span
                            title="2FA Authenticator Active"
                            className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-mono font-bold text-emerald-500 border border-emerald-500/20"
                          >
                            2FA
                          </span>
                        )}
                        {item.attachments && item.attachments.length > 0 && (
                          <span
                            title={`${item.attachments.length} Secure Attachment${item.attachments.length > 1 ? "s" : ""}`}
                            className="rounded bg-blue-500/10 px-1 py-0.2 text-[9px] font-mono font-bold text-blue-400 border border-blue-500/20"
                          >
                            📎 {item.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <small className="block truncate font-mono text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {item.username}
                    </small>
                  </div>
                </div>

                {/* Row Quick Action Buttons */}
                {!isTrashView && !isSelectMode && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {/* Quick Copy Username */}
                    {item.username && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickCopyUser(e, item)}
                        className={`p-1 rounded transition ${
                          copiedField?.id === item.id && copiedField.field === "user"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--text-primary)] hover:bg-[var(--bg-app)]"
                        }`}
                        title="Quick Copy Username"
                      >
                        {copiedField?.id === item.id && copiedField.field === "user" ? (
                          <Check className="size-3" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    )}

                    {/* Quick Copy Password */}
                    {item.password && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickCopyPass(e, item)}
                        className={`p-1 rounded transition ${
                          copiedField?.id === item.id && copiedField.field === "pass"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-blue-400 hover:bg-[var(--bg-app)]"
                        }`}
                        title="Quick Copy Password"
                      >
                        {copiedField?.id === item.id && copiedField.field === "pass" ? (
                          <Check className="size-3" />
                        ) : (
                          <KeyRound className="size-3" />
                        )}
                      </button>
                    )}

                    {/* Favorite Pin */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      className={`p-1 transition active:scale-90 ${
                        item.favorite
                          ? "text-amber-500 hover:text-amber-600"
                          : "text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-500"
                      }`}
                      title={item.favorite ? "Unpin from favorites" : "Pin to favorites"}
                    >
                      <Star
                        className={`size-3.5 ${item.favorite ? "fill-amber-500" : ""}`}
                      />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-6">
            {searchQuery ? (
              <EmptyState
                type="search"
                searchQuery={searchQuery}
                onClearSearch={onClearSearch}
                onAddNewItem={onAddNewItem}
              />
            ) : activeFolder ? (
              <EmptyState
                type="folder"
                folderName={activeFolder.name}
                onManageFolder={onOpenManageFolder ? () => onOpenManageFolder(activeFolder) : undefined}
                onAddNewItem={onAddNewItem}
              />
            ) : isTrashView ? (
              <EmptyState type="trash" />
            ) : category === "favorites" ? (
              <EmptyState type="favorites" />
            ) : (
              <EmptyState type={category} onAddNewItem={onAddNewItem} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
