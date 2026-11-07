import { useMemo, useState } from "react";
import {
  FilterCategory,
  Member,
  MemberRole,
  SortOption,
  VaultItem,
  VaultItemType,
  VaultScope,
} from "@/types/vault";
import {
  STARTER_MEMBERS,
  STARTER_ORGANIZATION_ITEMS,
  STARTER_PERSONAL_ITEMS,
  STORAGE_KEYS,
} from "@/lib/constants";
import { runSecurityAudit } from "@/lib/securityAudit";
import { useLocalStorage } from "./useLocalStorage";
import { useEncryptedStore } from "./useEncryptedStore";
import { useVaultCrypto } from "@/context/VaultCryptoContext";

export type { FilterCategory };

export function useVault() {
  const { logAuditEvent } = useVaultCrypto();
  const [scope, setScope] = useState<VaultScope>("personal");
  const [activeAccount, setActiveAccount] = useState("Sahil Kumar");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterCategory>("all");
  const [sortOption, setSortOption] = useState<SortOption>("updated");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(1);

  const [personalItems, setPersonalItems] = useEncryptedStore<VaultItem[]>(
    STORAGE_KEYS.PERSONAL_ITEMS,
    STARTER_PERSONAL_ITEMS,
    STORAGE_KEYS.LEGACY_ITEMS
  );

  const [organizationItems, setOrganizationItems] = useEncryptedStore<VaultItem[]>(
    STORAGE_KEYS.ORGANIZATION_ITEMS,
    STARTER_ORGANIZATION_ITEMS
  );

  const [members, setMembers] = useLocalStorage<Member[]>(
    STORAGE_KEYS.MEMBERS,
    STARTER_MEMBERS
  );

  const currentItems = scope === "personal" ? personalItems : organizationItems;
  const scopeLabel = scope === "personal" ? "Personal Vault" : "Northstar Studio";

  // Dynamic security audit calculated across actual vault items
  const securityAudit = useMemo(() => {
    return runSecurityAudit(currentItems);
  }, [currentItems]);

  // Dynamic category & trash counts
  const counts = useMemo(() => {
    const active = currentItems.filter((i) => !i.isTrashed);
    const trashed = currentItems.filter((i) => Boolean(i.isTrashed));

    return {
      all: active.length,
      Login: active.filter((i) => i.type === "Login").length,
      Card: active.filter((i) => i.type === "Card").length,
      Identity: active.filter((i) => i.type === "Identity").length,
      "Secure note": active.filter((i) => i.type === "Secure note").length,
      favorites: active.filter((i) => Boolean(i.favorite)).length,
      trash: trashed.length,
    };
  }, [currentItems]);

  // Unique tags extracted from active items
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    currentItems
      .filter((i) => !i.isTrashed && i.tags)
      .forEach((item) => {
        item.tags?.forEach((t) => tagSet.add(t));
      });
    return Array.from(tagSet);
  }, [currentItems]);

  // Filtered and sorted items
  const displayedItems = useMemo(() => {
    let result = [...currentItems];

    if (category === "trash") {
      result = result.filter((item) => Boolean(item.isTrashed));
    } else {
      // Normal views only show non-trashed items
      result = result.filter((item) => !item.isTrashed);

      if (category === "favorites") {
        result = result.filter((item) => Boolean(item.favorite));
      } else if (category !== "all") {
        result = result.filter((item) => item.type === category);
      }
    }

    // Filter by folder if selected
    if (selectedFolderId) {
      result = result.filter((item) => item.folderId === selectedFolderId);
    }

    // Filter by tag if selected
    if (selectedTag) {
      result = result.filter((item) => item.tags?.includes(selectedTag));
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.username.toLowerCase().includes(q) ||
          (item.url && item.url.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort items
    result.sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === "type") {
        return a.type.localeCompare(b.type);
      }
      // "updated" default
      return b.id - a.id;
    });

    return result;
  }, [currentItems, category, query, sortOption, selectedTag, selectedFolderId]);

  // Currently selected item
  const selectedItem = useMemo(() => {
    if (selectedItemId === null) return undefined;
    return currentItems.find((item) => item.id === selectedItemId);
  }, [currentItems, selectedItemId]);

  const addItem = (item: {
    name: string;
    username: string;
    type: VaultItemType;
    password?: string;
    url?: string;
    notes?: string;
    favorite?: boolean;
    folderId?: string;
    tags?: string[];
    totpSecret?: string;
    cardDetails?: VaultItem["cardDetails"];
    identityDetails?: VaultItem["identityDetails"];
    customFields?: VaultItem["customFields"];
  }) => {
    const colorMap: Record<VaultItemType, string> = {
      Login: "bg-blue-600 text-white",
      Card: "bg-emerald-600 text-white",
      Identity: "bg-purple-600 text-white",
      "Secure note": "bg-amber-600 text-white",
    };

    const newItem: VaultItem = {
      id: Date.now(),
      name: item.name,
      username: item.username,
      password: item.password,
      url: item.url,
      notes: item.notes,
      type: item.type,
      color: colorMap[item.type] || "bg-slate-700 text-white",
      updated: "Just now",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      favorite: item.favorite || false,
      folderId: item.folderId,
      tags: item.tags || [item.type],
      totpSecret: item.totpSecret,
      cardDetails: item.cardDetails,
      identityDetails: item.identityDetails,
      customFields: item.customFields,
      passwordHistory: item.password
        ? [{ password: item.password, changedAt: "Created" }]
        : [],
    };

    if (scope === "personal") {
      setPersonalItems((prev) => [newItem, ...prev]);
    } else {
      setOrganizationItems((prev) => [newItem, ...prev]);
    }

    logAuditEvent("ITEM_CREATED", activeAccount, { id: newItem.id, name: newItem.name });
    setSelectedItemId(newItem.id);
  };

  const updateItem = (id: number, updates: Partial<VaultItem>) => {
    const updater = (prev: VaultItem[]) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let history = item.passwordHistory || [];
        // If password is being updated, store previous password in history
        if (updates.password && updates.password !== item.password && item.password) {
          history = [
            { password: item.password, changedAt: new Date().toLocaleDateString() },
            ...history,
          ];
        }

        return {
          ...item,
          ...updates,
          passwordHistory: history,
          updated: "Just now",
        };
      });

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_UPDATED", activeAccount, { id, fields: Object.keys(updates) });
  };

  const duplicateItem = (id: number) => {
    const original = currentItems.find((i) => i.id === id);
    if (!original) return;

    const cloned: VaultItem = {
      ...original,
      id: Date.now(),
      name: `${original.name} (Copy)`,
      updated: "Just now",
      createdAt: "Today",
    };

    if (scope === "personal") {
      setPersonalItems((prev) => [cloned, ...prev]);
    } else {
      setOrganizationItems((prev) => [cloned, ...prev]);
    }

    setSelectedItemId(cloned.id);
  };

  const toggleFavorite = (id: number) => {
    const updater = (prev: VaultItem[]) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      );

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_UPDATED", activeAccount, { id, action: "toggleFavorite" });
  };

  const trashItem = (id: number) => {
    const updater = (prev: VaultItem[]) =>
      prev.map((item) => (item.id === id ? { ...item, isTrashed: true } : item));

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    // Select another active item
    const nextItem = currentItems.find((i) => i.id !== id && !i.isTrashed);
    setSelectedItemId(nextItem ? nextItem.id : null);
  };

  const restoreItem = (id: number) => {
    const updater = (prev: VaultItem[]) =>
      prev.map((item) => (item.id === id ? { ...item, isTrashed: false } : item));

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_UPDATED", activeAccount, { id, action: "toggleFavorite" });
  };

  const deleteItemPermanently = (id: number) => {
    const updater = (prev: VaultItem[]) => prev.filter((item) => item.id !== id);

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_DELETED", activeAccount, { id });

    if (selectedItemId === id) {
      const remaining = currentItems.filter((i) => i.id !== id);
      setSelectedItemId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const moveItemsToFolder = (itemIds: number[], folderId: string | null) => {
    const targetFolderId = folderId || undefined;
    const updater = (prev: VaultItem[]) =>
      prev.map((item) =>
        itemIds.includes(item.id)
          ? { ...item, folderId: targetFolderId, updated: "Just now" }
          : item
      );

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_UPDATED", activeAccount, { itemIds, folderId });
  };

  const syncFolderItems = (folderId: string, itemIdsInFolder: number[]) => {
    const updater = (prev: VaultItem[]) =>
      prev.map((item) => {
        if (itemIdsInFolder.includes(item.id)) {
          return { ...item, folderId, updated: "Just now" };
        } else if (item.folderId === folderId) {
          return { ...item, folderId: undefined, updated: "Just now" };
        }
        return item;
      });

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_UPDATED", activeAccount, { folderId, count: itemIdsInFolder.length });
  };

  const batchTrashItems = (itemIds: number[]) => {
    const updater = (prev: VaultItem[]) =>
      prev.map((item) =>
        itemIds.includes(item.id)
          ? { ...item, isTrashed: true, updated: "Just now" }
          : item
      );

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_UPDATED", activeAccount, { batchTrash: itemIds });
  };

  const batchFavoriteItems = (itemIds: number[], favorite: boolean) => {
    const updater = (prev: VaultItem[]) =>
      prev.map((item) =>
        itemIds.includes(item.id)
          ? { ...item, favorite, updated: "Just now" }
          : item
      );

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_UPDATED", activeAccount, { batchFavorite: itemIds, favorite });
  };

  const emptyTrash = () => {
    const updater = (prev: VaultItem[]) => prev.filter((item) => !item.isTrashed);

    if (scope === "personal") {
      setPersonalItems(updater);
    } else {
      setOrganizationItems(updater);
    }

    logAuditEvent("ITEM_DELETED", activeAccount, { action: "emptyTrash" });
  };

  const importItems = (newItems: VaultItem[]) => {
    if (scope === "personal") {
      setPersonalItems((prev) => [...newItems, ...prev]);
    } else {
      setOrganizationItems((prev) => [...newItems, ...prev]);
    }
    if (newItems.length > 0) {
      setSelectedItemId(newItems[0].id);
    }
  };

  const inviteMember = (email: string, role: MemberRole) => {
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    const initials = email.slice(0, 2).toUpperCase();
    const newMember: Member = {
      id: Date.now(),
      name,
      email,
      role,
      status: "Invited",
      initials,
      joinedAt: "Pending",
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const updateMemberRole = (id: number, newRole: MemberRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const removeMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const purgeVault = () => {
    if (scope === "personal") {
      setPersonalItems([]);
    } else {
      setOrganizationItems([]);
    }
    logAuditEvent("ITEM_DELETED", activeAccount, { action: "purgeVault" });
    setSelectedItemId(null);
  };

  return {
    scope,
    setScope,
    activeAccount,
    setActiveAccount,
    query,
    setQuery,
    category,
    setCategory,
    sortOption,
    setSortOption,
    selectedTag,
    setSelectedTag,
    availableTags,
    selectedFolderId,
    setSelectedFolderId,
    selectedItemId,
    setSelectedItemId,
    selectedItem,
    items: currentItems,
    counts,
    members,
    scopeLabel,
    displayedItems,
    securityAudit,
    addItem,
    updateItem,
    duplicateItem,
    toggleFavorite,
    trashItem,
    restoreItem,
    deleteItemPermanently,
    emptyTrash,
    purgeVault,
    moveItemsToFolder,
    syncFolderItems,
    batchTrashItems,
    batchFavoriteItems,
    importItems,
    inviteMember,
    updateMemberRole,
    removeMember,
  };
}
