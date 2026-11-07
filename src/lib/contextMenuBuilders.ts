import {
  ArrowUpDown,
  Check,
  CheckSquare,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  KeyRound,
  Lock,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Share2,
  Star,
  Sun,
  Trash2,
} from "lucide-react";
import { Folder, SortOption, VaultItem } from "@/types/vault";
import { ContextMenuEntry } from "@/types/contextMenu";
import { copySensitiveText, copyTextSafely } from "./clipboard";

export function buildVaultItemContextMenu({
  item,
  folders = [],
  isTrashView = false,
  onSelectItem,
  onEditItem,
  onToggleFavorite,
  onDuplicateItem,
  onTrashItem,
  onRestoreItem,
  onDeletePermanently,
  onMoveToFolder,
  onCreateFolderPrompt,
  onNotify,
}: {
  item: VaultItem;
  folders?: Folder[];
  isTrashView?: boolean;
  onSelectItem?: (id: number) => void;
  onEditItem?: (item: VaultItem) => void;
  onToggleFavorite?: (id: number) => void;
  onDuplicateItem?: (id: number) => void;
  onTrashItem?: (id: number) => void;
  onRestoreItem?: (id: number) => void;
  onDeletePermanently?: (id: number) => void;
  onMoveToFolder?: (itemId: number, folderId: string | null) => void;
  onCreateFolderPrompt?: () => void;
  onNotify: (msg: string) => void;
}): ContextMenuEntry[] {
  const entries: ContextMenuEntry[] = [];

  // 1. Inspect / Edit
  if (!isTrashView && onEditItem) {
    entries.push({
      id: "edit",
      label: "Edit Credential",
      icon: Edit3,
      onClick: () => onEditItem(item),
    });
  } else if (onSelectItem) {
    entries.push({
      id: "inspect",
      label: "View Details",
      icon: ExternalLink,
      onClick: () => onSelectItem(item.id),
    });
  }

  // 2. Quick Copy Actions
  const copyActions: ContextMenuEntry[] = [];
  if (item.username) {
    copyActions.push({
      id: "copy-username",
      label: item.type === "Card" ? "Copy Card Number" : "Copy Username",
      icon: Copy,
      onClick: () => {
        copyTextSafely(item.username);
        onNotify("Username copied to clipboard");
      },
    });
  }

  if (item.cardDetails?.cardNumber) {
    copyActions.push({
      id: "copy-card-number",
      label: "Copy Card Number",
      icon: Copy,
      onClick: () => {
        copySensitiveText(item.cardDetails!.cardNumber!, "Card number", undefined, onNotify);
      },
    });
  }

  if (item.password) {
    copyActions.push({
      id: "copy-password",
      label: "Copy Password",
      icon: KeyRound,
      onClick: () => {
        copySensitiveText(item.password!, "Password", undefined, onNotify);
      },
    });
  }

  if (item.totpSecret) {
    copyActions.push({
      id: "copy-totp",
      label: "Copy TOTP Authenticator Code",
      icon: Clock,
      onClick: () => {
        onNotify("TOTP Authenticator active in detail pane");
        onSelectItem?.(item.id);
      },
    });
  }

  if (item.url) {
    copyActions.push({
      id: "copy-url",
      label: "Copy Website URL",
      icon: Copy,
      onClick: () => {
        copyTextSafely(item.url!);
        onNotify("Website URL copied");
      },
    });
    copyActions.push({
      id: "open-url",
      label: "Open in Browser",
      icon: ExternalLink,
      onClick: () => {
        window.open(item.url, "_blank", "noreferrer");
      },
    });
  }

  if (copyActions.length > 0) {
    entries.push({ type: "divider" });
    entries.push(...copyActions);
  }

  // 3. Organization & Folders
  if (!isTrashView) {
    entries.push({ type: "divider", label: "ORGANIZATION" });

    // Submenu: Move to Folder
    if (onMoveToFolder) {
      const folderSubmenu: ContextMenuEntry[] = [
        {
          id: "folder-none",
          label: "(No Folder)",
          icon: FolderIcon,
          onClick: () => onMoveToFolder(item.id, null),
        },
      ];

      if (folders.length > 0) {
        folderSubmenu.push({ type: "divider", label: "AVAILABLE FOLDERS" });
        folders.forEach((f) => {
          const isCurrent = item.folderId === f.id;
          folderSubmenu.push({
            id: `folder-${f.id}`,
            label: f.name,
            icon: isCurrent ? Check : FolderOpen,
            badge: isCurrent ? "Current" : undefined,
            onClick: () => onMoveToFolder(item.id, f.id),
          });
        });
      }

      if (onCreateFolderPrompt) {
        folderSubmenu.push({ type: "divider" });
        folderSubmenu.push({
          id: "folder-create-new",
          label: "+ Create New Folder...",
          icon: FolderPlus,
          onClick: onCreateFolderPrompt,
        });
      }

      entries.push({
        id: "move-folder",
        label: "Move to Folder",
        icon: FolderIcon,
        submenu: folderSubmenu,
      });
    }

    if (onToggleFavorite) {
      entries.push({
        id: "favorite",
        label: item.favorite ? "Unpin Favorite" : "Pin to Favorites",
        icon: Star,
        onClick: () => onToggleFavorite(item.id),
      });
    }

    if (onDuplicateItem) {
      entries.push({
        id: "duplicate",
        label: "Duplicate Item",
        icon: Share2,
        onClick: () => onDuplicateItem(item.id),
      });
    }
  }

  // 4. Trash / Destructive Actions
  entries.push({ type: "divider", label: "ACTIONS" });

  if (isTrashView) {
    if (onRestoreItem) {
      entries.push({
        id: "restore",
        label: "Restore Item",
        icon: RotateCcw,
        onClick: () => onRestoreItem(item.id),
      });
    }
    if (onDeletePermanently) {
      entries.push({
        id: "delete-permanent",
        label: "Delete Permanently",
        icon: Trash2,
        danger: true,
        onClick: () => {
          if (confirm(`Permanently delete "${item.name}"?`)) {
            onDeletePermanently(item.id);
          }
        },
      });
    }
  } else if (onTrashItem) {
    entries.push({
      id: "trash",
      label: "Move to Trash",
      icon: Trash2,
      danger: true,
      onClick: () => onTrashItem(item.id),
    });
  }

  return entries;
}

export function buildFolderContextMenu({
  folder,
  onAddNewItemToFolder,
  onManageFolderItems,
  onSelectFolder,
  onRenameFolder,
  onDeleteFolder,
  onNotify,
}: {
  folder: Folder;
  onAddNewItemToFolder: (folderId: string) => void;
  onManageFolderItems: (folder: Folder) => void;
  onSelectFolder: (folderId: string) => void;
  onRenameFolder?: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onNotify: (msg: string) => void;
}): ContextMenuEntry[] {
  return [
    {
      id: "add-item-to-folder",
      label: "Add New Item Here",
      icon: Plus,
      shortcut: "⌘N",
      onClick: () => onAddNewItemToFolder(folder.id),
    },
    {
      id: "manage-items",
      label: "Manage Folder Items",
      icon: CheckSquare,
      onClick: () => onManageFolderItems(folder),
    },
    {
      id: "view-folder",
      label: "View Items in Folder",
      icon: FolderOpen,
      onClick: () => onSelectFolder(folder.id),
    },
    { type: "divider" },
    {
      id: "rename-folder",
      label: "Rename Folder",
      icon: Edit3,
      onClick: () => {
        if (onRenameFolder) {
          onRenameFolder(folder);
        } else {
          const newName = prompt("Rename folder to:", folder.name);
          if (newName && newName.trim()) {
            onNotify(`Folder renamed to "${newName.trim()}"`);
          }
        }
      },
    },
    {
      id: "delete-folder",
      label: "Delete Folder",
      icon: Trash2,
      danger: true,
      onClick: () => {
        if (confirm(`Delete folder "${folder.name}"? Vault items will be unassigned from this folder.`)) {
          onDeleteFolder(folder.id);
          onNotify(`Folder "${folder.name}" deleted`);
        }
      },
    },
  ];
}

export function buildListBackgroundContextMenu({
  activeFolder,
  onAddNewItem,
  onCreateFolder,
  onToggleSelectMode,
  onSortChange,
  onLockVault,
}: {
  activeFolder?: Folder | null;
  onAddNewItem: () => void;
  onCreateFolder?: () => void;
  onToggleSelectMode?: () => void;
  onSortChange?: (sort: SortOption) => void;
  onLockVault: () => void;
}): ContextMenuEntry[] {
  const entries: ContextMenuEntry[] = [
    {
      id: "new-item",
      label: activeFolder ? `New Item in ${activeFolder.name}` : "New Vault Item",
      icon: Plus,
      shortcut: "⌘N",
      onClick: onAddNewItem,
    },
  ];

  if (onCreateFolder) {
    entries.push({
      id: "new-folder",
      label: "New Folder",
      icon: FolderPlus,
      onClick: onCreateFolder,
    });
  }

  entries.push({ type: "divider" });

  if (onToggleSelectMode) {
    entries.push({
      id: "select-mode",
      label: "Batch Select Items",
      icon: CheckSquare,
      onClick: onToggleSelectMode,
    });
  }

  if (onSortChange) {
    entries.push({
      id: "sort-by",
      label: "Sort Items",
      icon: ArrowUpDown,
      submenu: [
        {
          id: "sort-updated",
          label: "Recently Updated",
          onClick: () => onSortChange("updated"),
        },
        {
          id: "sort-name",
          label: "Name (A–Z)",
          onClick: () => onSortChange("name"),
        },
        {
          id: "sort-type",
          label: "Item Type",
          onClick: () => onSortChange("type"),
        },
      ],
    });
  }

  entries.push({ type: "divider" });
  entries.push({
    id: "lock-vault",
    label: "Lock Vault",
    icon: Lock,
    shortcut: "⌘L",
    onClick: onLockVault,
  });

  return entries;
}

export function buildGlobalContextMenu({
  onAddNewItem,
  onCreateFolder,
  onOpenCommandPalette,
  onLockVault,
  onToggleTheme,
  currentTheme,
}: {
  onAddNewItem: () => void;
  onCreateFolder?: () => void;
  onOpenCommandPalette: () => void;
  onLockVault: () => void;
  onToggleTheme: () => void;
  currentTheme: string;
}): ContextMenuEntry[] {
  const entries: ContextMenuEntry[] = [
    {
      id: "global-new-item",
      label: "New Vault Item",
      icon: Plus,
      shortcut: "⌘N",
      onClick: onAddNewItem,
    },
  ];

  if (onCreateFolder) {
    entries.push({
      id: "global-new-folder",
      label: "New Folder",
      icon: FolderPlus,
      onClick: onCreateFolder,
    });
  }

  entries.push({
    id: "global-command-palette",
    label: "Command Palette",
    icon: Search,
    shortcut: "⌘K",
    onClick: onOpenCommandPalette,
  });

  entries.push({ type: "divider" });

  entries.push({
    id: "global-lock-vault",
    label: "Lock Vault",
    icon: Lock,
    shortcut: "⌘L",
    onClick: onLockVault,
  });

  entries.push({
    id: "global-theme",
    label: currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
    icon: currentTheme === "dark" ? Sun : Moon,
    onClick: onToggleTheme,
  });

  return entries;
}

