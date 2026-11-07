"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Folder as FolderType, VaultItem, ViewType } from "@/types/vault";
import { useVault } from "@/hooks/useVault";
import { useFolders } from "@/hooks/useFolders";
import { useVaultSend } from "@/hooks/useVaultSend";
import { useVaultSettings } from "@/hooks/useVaultSettings";
import { useToast } from "@/hooks/useToast";
import { useTheme } from "@/hooks/useTheme";
import { useVaultLock } from "@/hooks/useVaultLock";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toast } from "@/components/common/Toast";
import { LockScreen } from "@/components/layout/LockScreen";
import { VaultItemList } from "@/components/vault/VaultItemList";
import { VaultItemDetail } from "@/components/vault/VaultItemDetail";
import { NewItemModal } from "@/components/vault/NewItemModal";
import { PasswordGenerator } from "@/components/generator/PasswordGenerator";
import { SendView } from "@/components/send/SendView";
import { VaultReportsSuite } from "@/components/reports/VaultReportsSuite";
import { ToolsView } from "@/components/tools/ToolsView";
import { SettingsView } from "@/components/settings/SettingsView";
import { MembersView } from "@/components/members/MembersView";
import { InviteMemberModal } from "@/components/members/InviteMemberModal";
import { QuickCommandPalette } from "@/components/common/QuickCommandPalette";
import { KeyboardShortcutsModal } from "@/components/common/KeyboardShortcutsModal";
import { ManageFolderItemsModal } from "@/components/vault/ManageFolderItemsModal";
import { useSecurityShield } from "@/hooks/useSecurityShield";
import { PrivacyShieldScreen } from "@/components/common/PrivacyShieldScreen";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ContextMenuProvider } from "@/context/ContextMenuContext";
import { ContextMenu } from "@/components/common/ContextMenu";
import { buildGlobalContextMenu } from "@/lib/contextMenuBuilders";
import {
  GenericViewSkeleton,
  ReportsSkeleton,
  SendSkeleton,
} from "@/components/common/SkeletonLoader";
import { VaultCryptoProvider } from "@/context/VaultCryptoContext";

function HomeContent() {
  const [view, setView] = useState<ViewType>("vault");
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [folderToManage, setFolderToManage] = useState<FolderType | null>(null);
  const [prefilledPassword, setPrefilledPassword] = useState<string | undefined>();
  const [preselectedFolderId, setPreselectedFolderId] = useState<string | undefined>();

  const handleSelectView = (newView: ViewType) => {
    if (newView === view) return;
    setIsViewLoading(true);
    setView(newView);
    const timer = setTimeout(() => {
      setIsViewLoading(false);
    }, 180);
    return () => clearTimeout(timer);
  };

  const { theme, setTheme } = useTheme();
  const { isLocked, lock, unlock, changePassphrase } = useVaultLock();

  const {
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
    items,
    displayedItems,
    counts,
    members,
    scopeLabel,
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
  } = useVault();

  const { folders, addFolder, deleteFolder, renameFolder } = useFolders(scope);
  const { sends } = useVaultSend();
  const { settings, updateSettings } = useVaultSettings();
  const { toast, notify } = useToast();

  const handleAddNewItem = useCallback((folderId?: string) => {
    setPrefilledPassword(undefined);
    setPreselectedFolderId(folderId);
    setShowNewItem(true);
  }, []);

  const handleCreateFolderPrompt = useCallback(() => {
    const name = prompt("Enter new folder name:");
    if (name && name.trim()) {
      addFolder(name.trim());
      notify(`Folder "${name.trim()}" created`);
    }
  }, [addFolder, notify]);

  const handleRenameFolderPrompt = useCallback(
    (folder: FolderType) => {
      const newName = prompt("Rename folder to:", folder.name);
      if (newName && newName.trim()) {
        renameFolder(folder.id, newName.trim());
        notify(`Folder renamed to "${newName.trim()}"`);
      }
    },
    [renameFolder, notify]
  );

  // Global Context Menu Fallback (Right click anywhere in empty areas)
  const globalFallbackItems = useCallback(() => {
    return buildGlobalContextMenu({
      onAddNewItem: () => handleAddNewItem(selectedFolderId || undefined),
      onCreateFolder: handleCreateFolderPrompt,
      onOpenCommandPalette: () => setShowCommandPalette(true),
      onLockVault: () => {
        lock();
        notify("Vault locked");
      },
      onToggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      currentTheme: theme,
    });
  }, [handleAddNewItem, selectedFolderId, handleCreateFolderPrompt, lock, notify, setTheme, theme]);

  // Security Hardening: Right-click & DevTools lockout, blur privacy mask, and clipboard purge
  const { isPrivacyMasked, dismissPrivacyMask } = useSecurityShield({
    onLockVault: lock,
    onNotify: notify,
    clipboardDelaySeconds: settings.clearClipboardDelay,
    enablePrivacyBlur: true,
  });

  // Compute live folder counts
  const folderItemCounts = useMemo(() => {
    const map: Record<string, number> = {};
    items
      .filter((i) => !i.isTrashed && i.folderId)
      .forEach((i) => {
        if (i.folderId) {
          map[i.folderId] = (map[i.folderId] || 0) + 1;
        }
      });
    return map;
  }, [items]);

  // Global Keyboard shortcuts: ⌘N (New), ⌘L (Lock), ⌘K (Spotlight), ⌘/ (Help), ↑/↓ (Navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleAddNewItem(selectedFolderId || undefined);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        lock();
        notify("Vault locked");
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if (((e.metaKey || e.ctrlKey) && e.key === "/") || (!isInput && e.key === "?")) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if (!isInput && view === "vault" && displayedItems.length > 0) {
        // Arrow/Vim key navigation across vault item list
        if (e.key === "ArrowDown" || e.key === "j") {
          e.preventDefault();
          const currentIndex = displayedItems.findIndex((i) => i.id === selectedItemId);
          const nextIndex =
            currentIndex === -1 || currentIndex >= displayedItems.length - 1
              ? 0
              : currentIndex + 1;
          setSelectedItemId(displayedItems[nextIndex].id);
        } else if (e.key === "ArrowUp" || e.key === "k") {
          e.preventDefault();
          const currentIndex = displayedItems.findIndex((i) => i.id === selectedItemId);
          const prevIndex =
            currentIndex <= 0
              ? displayedItems.length - 1
              : currentIndex - 1;
          setSelectedItemId(displayedItems[prevIndex].id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayedItems, handleAddNewItem, lock, notify, selectedFolderId, selectedItemId, setSelectedItemId, view]);

  const handleSelectAccount = (account: string, newScope: "personal" | "organization") => {
    setActiveAccount(account);
    setScope(newScope);
    setView("vault");
    setSelectedFolderId(null);
    setShowAccounts(false);
    notify(`Switched to ${account}`);
  };

  const handleSavePasswordFromGenerator = (password: string) => {
    setPrefilledPassword(password);
    setShowNewItem(true);
  };

  const handleFixAuditItem = (item: VaultItem) => {
    setView("vault");
    setSelectedFolderId(null);
    setSelectedItemId(item.id);
    notify(`Inspecting "${item.name}"`);
  };

  return (
    <ErrorBoundary>
      <ContextMenuProvider globalFallbackItems={globalFallbackItems}>
        <main
          data-density={settings.density || "comfortable"}
          data-accent={settings.accentColor || "blue"}
          className="h-screen w-screen overflow-hidden flex bg-[var(--bg-app)] text-[var(--text-primary)]"
        >
          {/* Master Passphrase Lock Screen Overlay */}
          {isLocked && <LockScreen onUnlock={unlock} onNotify={notify} />}

          {/* Privacy Shield Mask (on window blur / tab inactive) */}
          <PrivacyShieldScreen
            isActive={isPrivacyMasked && !isLocked}
            onResume={dismissPrivacyMask}
          />

          {/* Spotlight Command Palette (⌘K) */}
          <QuickCommandPalette
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            items={items}
            onSelectItem={(id) => {
              setSelectedItemId(id);
              handleSelectView("vault");
            }}
            onSelectView={handleSelectView}
            onAddNewItem={() => handleAddNewItem(selectedFolderId || undefined)}
            onLockVault={() => {
              lock();
              notify("Vault locked");
            }}
            onNotify={notify}
          />

          {/* Fixed Left Sidebar with Categories, Folders, & Security Tools */}
          <Sidebar
            currentView={view}
            onSelectView={handleSelectView}
            category={category}
            onSelectCategory={setCategory}
            counts={counts}
            scope={scope}
            activeAccount={activeAccount}
            isAccountSwitcherOpen={showAccounts}
            onToggleAccountSwitcher={() => setShowAccounts((prev) => !prev)}
            onCloseAccountSwitcher={() => setShowAccounts(false)}
            onSelectAccount={handleSelectAccount}
            members={members}
            onAddNewItem={() => handleAddNewItem()}
            onAddNewItemToFolder={(folderId) => handleAddNewItem(folderId)}
            onRenameFolder={handleRenameFolderPrompt}
            onLockVault={() => {
              lock();
              notify("Vault locked");
            }}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onAddFolder={addFolder}
            onDeleteFolder={deleteFolder}
            onOpenManageFolder={(folder) => setFolderToManage(folder)}
            folderItemCounts={folderItemCounts}
            activeSendCount={sends.length}
            onNotify={notify}
          />

          {/* Main Desktop Workspace Area */}
          <div className="ml-64 flex flex-1 flex-col h-full overflow-hidden">
            {/* Desktop Topbar */}
            <Header
              query={query}
              onQueryChange={(newQuery) => {
                setQuery(newQuery);
                if (view !== "vault") {
                  handleSelectView("vault");
                }
              }}
              scope={scope}
              activeAccount={activeAccount}
              onNotify={notify}
              userInitials={scope === "personal" ? "SK" : "NS"}
              theme={theme}
              onToggleTheme={setTheme}
              onOpenCommandPalette={() => setShowCommandPalette(true)}
              density={settings.density || "comfortable"}
              onToggleDensity={() =>
                updateSettings({
                  density: settings.density === "compact" ? "comfortable" : "compact",
                })
              }
              onLockVault={() => {
                lock();
                notify("Vault locked");
              }}
              onOpenShortcuts={() => setShowShortcutsModal(true)}
            />

            {/* Dynamic Views */}
            <div className="flex flex-1 overflow-hidden">
              {view === "vault" && (
                <>
                  {/* Middle Pane: Items List with dynamic tag filters, folder banner, and multi-select */}
                  <VaultItemList
                    items={displayedItems}
                    selectedItemId={selectedItemId}
                    onSelectItem={setSelectedItemId}
                    category={category}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    onToggleFavorite={toggleFavorite}
                    availableTags={availableTags}
                    selectedTag={selectedTag}
                    onSelectTag={setSelectedTag}
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    onOpenManageFolder={(folder) => setFolderToManage(folder)}
                    onMoveItemsToFolder={moveItemsToFolder}
                    onBatchTrashItems={batchTrashItems}
                    onBatchFavoriteItems={batchFavoriteItems}
                    isLoading={isViewLoading}
                    searchQuery={query}
                    onClearSearch={() => setQuery("")}
                    onAddNewItem={(folderId) =>
                      handleAddNewItem(folderId || (selectedFolderId || undefined))
                    }
                    onDuplicateItem={duplicateItem}
                    onTrashItem={trashItem}
                    onRestoreItem={restoreItem}
                    onDeletePermanently={deleteItemPermanently}
                    onCreateFolderPrompt={handleCreateFolderPrompt}
                    onRenameFolder={handleRenameFolderPrompt}
                    onDeleteFolder={deleteFolder}
                    onLockVault={() => {
                      lock();
                      notify("Vault locked");
                    }}
                    onNotify={notify}
                    onEmptyTrash={() => {
                      if (confirm("Permanently empty all items in Trash?")) {
                        emptyTrash();
                        notify("Trash emptied");
                      }
                    }}
                    density={settings.density || "comfortable"}
                    onToggleDensity={() =>
                      updateSettings({
                        density: settings.density === "compact" ? "comfortable" : "compact",
                      })
                    }
                  />

                  {/* Right Pane: Inspector / Detail with Inline Editing, TOTP & History */}
                  <VaultItemDetail
                    item={selectedItem}
                    scopeLabel={scopeLabel}
                    folders={folders}
                    onToggleFavorite={toggleFavorite}
                    onTrashItem={trashItem}
                    onRestoreItem={restoreItem}
                    onDeletePermanently={deleteItemPermanently}
                    onDuplicateItem={duplicateItem}
                    onUpdateItem={updateItem}
                    onMoveToFolder={(itemId, folderId) => {
                      moveItemsToFolder([itemId], folderId);
                    }}
                    onCreateFolderPrompt={handleCreateFolderPrompt}
                    onNotify={notify}
                    isLoading={isViewLoading}
                  />
                </>
              )}

              {view === "send" && (
                isViewLoading ? <SendSkeleton /> : <SendView onNotify={notify} />
              )}

              {view === "generator" && (
                <PasswordGenerator
                  onSavePassword={handleSavePasswordFromGenerator}
                  onNotify={notify}
                />
              )}

              {view === "reports" && (
                isViewLoading ? (
                  <ReportsSkeleton />
                ) : (
                  <VaultReportsSuite
                    audit={securityAudit}
                    items={items}
                    onFixItem={handleFixAuditItem}
                    onNotify={notify}
                  />
                )
              )}

              {view === "tools" && (
                isViewLoading ? (
                  <GenericViewSkeleton title="Loading Migration Tools..." />
                ) : (
                  <ToolsView
                    items={items}
                    members={members}
                    scopeLabel={scopeLabel}
                    onImportItems={(newItems) => {
                      importItems(newItems);
                      notify(`Imported ${newItems.length} items`);
                    }}
                    onPurgeVault={purgeVault}
                    onNotify={notify}
                  />
                )
              )}

              {view === "settings" && (
                isViewLoading ? (
                  <GenericViewSkeleton title="Loading Preferences..." />
                ) : (
                  <SettingsView
                    settings={settings}
                    onUpdateSettings={updateSettings}
                    theme={theme}
                    onToggleTheme={setTheme}
                    onChangeMasterPassphrase={changePassphrase}
                    onNotify={notify}
                  />
                )
              )}

              {view === "members" && (
                isViewLoading ? (
                  <GenericViewSkeleton title="Loading Workspace Members..." />
                ) : (
                  <MembersView
                    members={members}
                    onInvite={() => setShowInvite(true)}
                    onUpdateRole={updateMemberRole}
                    onRemoveMember={(id) => {
                      removeMember(id);
                      notify("Member removed from workspace");
                    }}
                    onManagePlan={() => notify("Redirecting to subscription billing")}
                  />
                )
              )}
            </div>
          </div>

          {/* Modals */}
          <NewItemModal
            isOpen={showNewItem}
            onClose={() => {
              setShowNewItem(false);
              setPrefilledPassword(undefined);
              setPreselectedFolderId(undefined);
            }}
            scope={scope}
            folders={folders}
            initialPassword={prefilledPassword}
            initialFolderId={preselectedFolderId}
            onCreateFolder={addFolder}
            onSave={(newItem) => {
              addItem(newItem);
              notify(`"${newItem.name}" saved to ${scopeLabel}`);
            }}
          />

          <InviteMemberModal
            isOpen={showInvite}
            onClose={() => setShowInvite(false)}
            onInvite={(email, role) => {
              inviteMember(email, role);
              notify(`Invitation email dispatched to ${email}`);
            }}
          />

          {/* Manage Folder Items (Add Multiple Items to Folder) Modal */}
          <ManageFolderItemsModal
            isOpen={folderToManage !== null}
            onClose={() => setFolderToManage(null)}
            folder={folderToManage}
            allItems={items}
            allFolders={folders}
            onSaveItemsToFolder={syncFolderItems}
            onNotify={notify}
          />

          <KeyboardShortcutsModal
            isOpen={showShortcutsModal}
            onClose={() => setShowShortcutsModal(false)}
          />

          {/* Global Right-Click Context Menu */}
          <ContextMenu />

          {/* Global Toast */}
          <Toast message={toast} />
        </main>
      </ContextMenuProvider>
    </ErrorBoundary>
  );
}

export default function Home() {
  return (
    <VaultCryptoProvider>
      <HomeContent />
    </VaultCryptoProvider>
  );
}
