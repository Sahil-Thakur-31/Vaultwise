import { Member, VaultItem } from "@/types/vault";

export function exportVaultToJson(
  items: VaultItem[],
  members: Member[],
  vaultName: string
) {
  const exportPayload = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    vaultName,
    items,
    members,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  const dateStr = new Date().toISOString().split("T")[0];
  link.download = `vaultwise-${vaultName.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseImportJson(jsonText: string): {
  success: boolean;
  items?: VaultItem[];
  members?: Member[];
  error?: string;
} {
  try {
    const data = JSON.parse(jsonText);

    if (Array.isArray(data)) {
      // Direct array of items
      return { success: true, items: data };
    }

    if (data && Array.isArray(data.items)) {
      return {
        success: true,
        items: data.items,
        members: Array.isArray(data.members) ? data.members : undefined,
      };
    }

    return {
      success: false,
      error: "Invalid JSON format: missing 'items' array.",
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse JSON file: ${(err as Error).message}`,
    };
  }
}
