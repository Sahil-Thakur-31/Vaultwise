"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Folder as FolderType, VaultItem } from "@/types/vault";
import { Modal } from "@/components/common/Modal";
import { ItemLogo } from "./ItemLogo";

interface ManageFolderItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: FolderType | null;
  allItems: VaultItem[];
  allFolders: FolderType[];
  onSaveItemsToFolder: (folderId: string, itemIdsInFolder: number[]) => void;
  onNotify: (msg: string) => void;
}

export function ManageFolderItemsModal({
  isOpen,
  onClose,
  folder,
  allItems,
  allFolders,
  onSaveItemsToFolder,
  onNotify,
}: ManageFolderItemsModalProps) {
  const [query, setQuery] = useState("");
  // Selected item IDs that should belong to this folder
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    if (!folder) return new Set();
    const initial = allItems
      .filter((i) => !i.isTrashed && i.folderId === folder.id)
      .map((i) => i.id);
    return new Set(initial);
  });

  // Re-initialize when folder changes or modal opens
  const activeItems = useMemo(() => {
    return allItems.filter((i) => !i.isTrashed);
  }, [allItems]);

  const folderMap = useMemo(() => {
    const map: Record<string, string> = {};
    allFolders.forEach((f) => {
      map[f.id] = f.name;
    });
    return map;
  }, [allFolders]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activeItems;
    return activeItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.username.toLowerCase().includes(q) ||
        (i.url && i.url.toLowerCase().includes(q))
    );
  }, [activeItems, query]);

  if (!isOpen || !folder) return null;

  const toggleItem = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredItems.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredItems.forEach((i) => next.delete(i.id));
      return next;
    });
  };

  const handleSave = () => {
    onSaveItemsToFolder(folder.id, Array.from(selectedIds));
    onNotify(`Folder "${folder.name}" updated with ${selectedIds.size} items`);
    onClose();
  };

  return (
    <Modal title={`Organize Items in "${folder.name}"`} onClose={onClose}>
      <div className="space-y-4 select-none">
        <p className="text-xs text-[var(--text-muted)]">
          Select all vault credentials, cards, identities, or notes you want to organize inside this folder.
        </p>

        {/* Search & Bulk Selection Bar */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] px-2.5 py-1.5 text-xs">
            <Search className="size-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items to include..."
              className="w-full bg-transparent text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
            />
          </div>

          <button
            type="button"
            onClick={selectAllFiltered}
            className="rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition shrink-0"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={deselectAllFiltered}
            className="rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition shrink-0"
          >
            Clear
          </button>
        </div>

        {/* Items Checklist */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)]">
          {filteredItems.map((item) => {
            const isChecked = selectedIds.has(item.id);
            const otherFolderName =
              item.folderId && item.folderId !== folder.id
                ? folderMap[item.folderId]
                : null;

            return (
              <label
                key={item.id}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 text-xs cursor-pointer transition ${
                  isChecked
                    ? "bg-blue-600/10 text-[var(--text-primary)]"
                    : "hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleItem(item.id)}
                    className="size-4 rounded accent-blue-600 cursor-pointer"
                  />
                  <ItemLogo item={item} size="sm" />
                  <div className="min-w-0">
                    <b className="block truncate font-semibold">{item.name}</b>
                    <small className="block truncate font-mono text-[11px] text-[var(--text-muted)]">
                      {item.username}
                    </small>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {otherFolderName && (
                    <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-500">
                      In {otherFolderName}
                    </span>
                  )}
                  {isChecked && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-500">
                      <Check className="size-3" /> In Folder
                    </span>
                  )}
                </div>
              </label>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No matching vault items found.
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            <b className="text-[var(--text-primary)]">{selectedIds.size}</b> items assigned to this folder
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border-subtle)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Save Folder Items
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
