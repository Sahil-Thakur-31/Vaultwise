"use client";

import { useMemo } from "react";
import { Folder, VaultScope } from "@/types/vault";
import { useLocalStorage } from "./useLocalStorage";

const FOLDER_STORAGE_KEY = "vaultwise-folders";

const STARTER_FOLDERS: Folder[] = [
  { id: "folder-1", name: "Development & Cloud", scope: "personal" },
  { id: "folder-2", name: "Finance & Banking", scope: "personal" },
  { id: "folder-3", name: "Design & Creative", scope: "personal" },
  { id: "folder-4", name: "Infrastructure & Prod", scope: "organization" },
  { id: "folder-5", name: "SaaS Billing", scope: "organization" },
];

export function useFolders(activeScope: VaultScope) {
  const [folders, setFolders] = useLocalStorage<Folder[]>(
    FOLDER_STORAGE_KEY,
    STARTER_FOLDERS
  );

  const scopeFolders = useMemo(() => {
    return folders.filter((f) => f.scope === activeScope);
  }, [folders, activeScope]);

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      scope: activeScope,
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const deleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
  };

  const renameFolder = (id: string, name: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: name.trim() } : f))
    );
  };

  return {
    folders: scopeFolders,
    allFolders: folders,
    addFolder,
    deleteFolder,
    renameFolder,
  };
}
