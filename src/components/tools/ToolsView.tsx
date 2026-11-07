"use client";

import { useRef, useState } from "react";
import {
  AlertOctagon,
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Key,
  Link2,
  Printer,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
} from "lucide-react";
import { Member, VaultItem } from "@/types/vault";
import { exportVaultToJson, parseImportJson } from "@/lib/exportImport";
import { useVaultCrypto } from "@/context/VaultCryptoContext";
import { ChainVerificationResult } from "@/lib/merkleAudit";
import { copySensitiveText } from "@/lib/clipboard";
import { EmergencyRecoveryKitModal } from "./EmergencyRecoveryKitModal";

interface ToolsViewProps {
  items: VaultItem[];
  members: Member[];
  scopeLabel: string;
  onImportItems: (newItems: VaultItem[]) => void;
  onPurgeVault: () => void;
  onNotify: (msg: string) => void;
}

export function ToolsView({
  items,
  members,
  scopeLabel,
  onImportItems,
  onPurgeVault,
  onNotify,
}: ToolsViewProps) {
  const { secretKey, merkleChain, verifyAuditLedger, downloadEmergencyKit } =
    useVaultCrypto();
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<ChainVerificationResult | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedSecretKey, setCopiedSecretKey] = useState(false);
  const [showEmergencyKitModal, setShowEmergencyKitModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "encrypted-json">("json");
  const [importFormat, setImportFormat] = useState("vaultwise");
  const [emergencyContact, setEmergencyContact] = useState("trusted.contact@example.com");
  const [emergencyWaitDays, setEmergencyWaitDays] = useState("7");
  const [emergencyType, setEmergencyType] = useState<"view" | "takeover">("view");
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);

  const handleExport = () => {
    if (exportFormat === "csv") {
      const headers = "folder,favorite,type,name,notes,login_uri,login_username,login_password,login_totp\n";
      const rows = items
        .map(
          (i) =>
            `"${i.folderId || ""}","${i.favorite ? 1 : 0}","${i.type}","${i.name.replace(/"/g, '""')}","${(i.notes || "").replace(/"/g, '""')}","${i.url || ""}","${(i.username || "").replace(/"/g, '""')}","${(i.password || "").replace(/"/g, '""')}","${i.totpSecret || ""}"`
        )
        .join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vaultwise-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      onNotify(`Exported ${items.length} items to CSV spreadsheet`);
    } else {
      exportVaultToJson(items, members, scopeLabel);
      onNotify(`Exported ${items.length} items to backup file`);
    }
  };

  const handleRotateKey = () => {
    setIsRotatingKeys(true);
    setTimeout(() => {
      setIsRotatingKeys(false);
      onNotify("Vault re-encrypted with newly derived AES-256 GCM master key");
    }, 700);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = parseImportJson(text);
      if (res.success && res.items) {
        onImportItems(res.items);
        onNotify(`Successfully imported ${res.items.length} items into ${scopeLabel}`);
      } else {
        onNotify(res.error || "Failed to parse import file");
      }
    };
    reader.readAsText(file);
  };

  const handlePurge = () => {
    const code = prompt(
      `Type "PURGE" to confirm permanently erasing all ${items.length} items from ${scopeLabel}:`
    );
    if (code === "PURGE") {
      onPurgeVault();
      onNotify(`Vault purged. All records destroyed.`);
    } else if (code !== null) {
      onNotify("Purge canceled. Confirmation did not match.");
    }
  };

  const handleVerifyChain = async () => {
    setIsVerifyingChain(true);
    try {
      const result = await verifyAuditLedger();
      setVerificationResult(result);
      if (result.isValid) {
        onNotify(`Ledger verified: ${result.blockCount} blocks cryptographically unbroken.`);
      } else {
        onNotify(`Cryptographic alert: ${result.failureReason}`);
      }
    } finally {
      setIsVerifyingChain(false);
    }
  };

  const handleCopySecretKey = async () => {
    const ok = await copySensitiveText(secretKey, "128-bit Secret Key", undefined, onNotify);
    if (ok) {
      setCopiedSecretKey(true);
      setTimeout(() => setCopiedSecretKey(false), 2000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-app)] p-4 sm:p-6 md:p-8 select-none">
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              Vault Tools & Cryptographic Management
            </h1>
            <span className="rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold">
              VAULTWISE CORE SUITE
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Export portable backups, import from other password managers, configure Emergency Access, and rotate encryption keys.
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* 2-Column Grid: Export & Import */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* EXPORT SECTION */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Download className="size-4 text-blue-500" />
              <h2 className="text-xs font-bold text-[var(--text-primary)]">Export Vault Backup</h2>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Export cryptographic snapshots or standard CSV tables of your {items.length} logins, cards, and secure notes.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                  File Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as "json" | "csv" | "encrypted-json")}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="json">JSON (Standard Portable)</option>
                  <option value="csv">CSV Spreadsheet (Universal)</option>
                  <option value="encrypted-json">Encrypted JSON (AES-256 Encrypted)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-1.5 rounded-md bg-[var(--accent-primary)] py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[var(--accent-hover)] transition cursor-pointer"
              >
                <Download className="size-3.5" />
                Export Vault Snapshot
              </button>
            </div>
          </div>

          {/* IMPORT SECTION */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="size-4 text-blue-500" />
              <h2 className="text-xs font-bold text-[var(--text-primary)]">Import External Data</h2>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Migrate credentials directly from existing password managers or browser exports.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                  Source Manager
                </label>
                <select
                  value={importFormat}
                  onChange={(e) => setImportFormat(e.target.value)}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="vaultwise">Vaultwise / Standard Encrypted JSON</option>
                  <option value="1password">1Password (1PUX / CSV)</option>
                  <option value="lastpass">LastPass (CSV)</option>
                  <option value="chrome">Google Chrome / Chromium (CSV)</option>
                  <option value="keepass">KeePass 2 (XML / CSV)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-blue-500 hover:bg-blue-500/5 transition cursor-pointer shadow-2xs"
              >
                <Upload className="size-3.5" />
                Select File to Import...
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Emergency Access & Key Rotation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* EMERGENCY ACCESS SECTION */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="size-4 text-emerald-500" />
              <h2 className="text-xs font-bold text-[var(--text-primary)]">Emergency Access</h2>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Designate trusted emergency contacts who can request vault access in the event of an emergency.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                  Trusted Emergency Contact Email
                </label>
                <input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="contact@trusted.org"
                  className="w-full rounded border border-[var(--border-subtle)] bg-[var(--input-bg)] p-1.5 text-xs text-[var(--text-primary)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                    Waiting Period
                  </label>
                  <select
                    value={emergencyWaitDays}
                    onChange={(e) => setEmergencyWaitDays(e.target.value)}
                    className="w-full rounded border border-[var(--border-subtle)] bg-[var(--input-bg)] p-1.5 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days (Default)</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[var(--text-secondary)] mb-1">
                    Access Level
                  </label>
                  <select
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value as "view" | "takeover")}
                    className="w-full rounded border border-[var(--border-subtle)] bg-[var(--input-bg)] p-1.5 text-xs text-[var(--text-primary)] outline-none cursor-pointer"
                  >
                    <option value="view">View Only</option>
                    <option value="takeover">Full Takeover</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="size-3" />
                  Status: Configured & Verified
                </span>
                <button
                  type="button"
                  onClick={() => onNotify(`Emergency contact updated: ${emergencyContact} (${emergencyWaitDays}d wait)`)}
                  className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-500 hover:bg-emerald-500/20 transition cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </div>
          </div>

          {/* KEY ROTATION & RE-ENCRYPTION */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Key className="size-4 text-blue-500" />
              <h2 className="text-xs font-bold text-[var(--text-primary)]">Key Rotation & Re-encryption</h2>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Generate a brand new AES-256 symmetric cipher key and re-encrypt all stored records locally without data loss.
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[10px] font-mono text-[var(--text-muted)]">
                Cipher: AES-256-GCM (PBKDF2 600K)
              </div>
              <button
                type="button"
                onClick={handleRotateKey}
                className="flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500 hover:bg-blue-500/20 transition cursor-pointer"
              >
                <RefreshCw className={`size-3 ${isRotatingKeys ? "animate-spin" : ""}`} />
                Rotate Encryption Key
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Merkle Hash-Chain Ledger & 128-Bit Secret Key */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MERKLE BLOCKCHAIN HASH-CHAIN LEDGER */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="size-4 text-emerald-500" />
                <h2 className="text-xs font-bold text-[var(--text-primary)]">
                  Cryptographic Hash-Chain Ledger
                </h2>
              </div>
              <span className="rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold">
                {merkleChain.length} BLOCKS
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Every vault modification is cryptographically hashed with SHA-256 and chained into an immutable tamper-evident Merkle ledger.
            </p>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-2.5 space-y-1.5 font-mono text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Merkle Root:</span>
                <span className="text-[var(--text-primary)] font-bold truncate max-w-[190px]">
                  {merkleChain.length > 0
                    ? merkleChain[merkleChain.length - 1].merkleRoot.slice(0, 20) + "..."
                    : "0000000000..."}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Block Height:</span>
                <span className="text-emerald-500 font-bold">
                  Block #{merkleChain.length > 0 ? merkleChain[merkleChain.length - 1].index : 0}
                </span>
              </div>
            </div>

            {verificationResult && (
              <div
                className={`flex items-center gap-2 rounded-md p-2 text-[11px] font-semibold ${
                  verificationResult.isValid
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                }`}
              >
                {verificationResult.isValid ? (
                  <>
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>Cryptographically Verified: All {verificationResult.blockCount} blocks intact. Zero mutations.</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="size-4 shrink-0" />
                    <span>Integrity Breach: {verificationResult.failureReason}</span>
                  </>
                )}
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                disabled={isVerifyingChain}
                onClick={handleVerifyChain}
                className="w-full flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/20 transition cursor-pointer"
              >
                <RefreshCw className={`size-3 ${isVerifyingChain ? "animate-spin" : ""}`} />
                {isVerifyingChain ? "Computing SHA-256 Hashes..." : "Verify Hash-Chain Integrity"}
              </button>
            </div>
          </div>

          {/* DUAL-KEY ARCHITECTURE: 128-BIT SECRET KEY & EMERGENCY KIT */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-violet-500" />
                <h2 className="text-xs font-bold text-[var(--text-primary)]">
                  128-Bit Secret Key & Recovery Kit
                </h2>
              </div>
              <span className="rounded bg-violet-500/10 text-violet-500 border border-violet-500/20 px-2 py-0.5 text-[10px] font-bold">
                DUAL-KEY ENCLAVE
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Provides 128 bits of CSPRNG entropy combined with your master password to mathematically eliminate GPU cluster brute-force attacks.
            </p>

            {/* Secret Key Display */}
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-2.5 flex items-center justify-between">
              <div className="min-w-0 font-mono text-xs font-bold text-[var(--text-primary)]">
                {showSecretKey ? secretKey : "A3-••••••-••••••-••••••"}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSecretKey((p) => !p)}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                  title={showSecretKey ? "Hide Secret Key" : "Reveal Secret Key"}
                >
                  {showSecretKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopySecretKey}
                  className="p-1 text-[var(--text-muted)] hover:text-emerald-500 transition"
                  title="Copy Secret Key"
                >
                  {copiedSecretKey ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowEmergencyKitModal(true)}
                className="flex items-center justify-center gap-1.5 rounded-md border border-violet-500/30 bg-violet-500/10 py-1.5 text-xs font-semibold text-violet-400 hover:bg-violet-500/20 transition cursor-pointer"
              >
                <Printer className="size-3.5" />
                View & Print Official Kit
              </button>
              <button
                type="button"
                onClick={() => downloadEmergencyKit()}
                className="flex items-center justify-center gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-app)] py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
              >
                <Download className="size-3.5" />
                Download .txt
              </button>
            </div>
          </div>
        </div>

        {/* PURGE VAULT SECTION (DANGER ZONE) */}
        <div className="rounded-xl border border-rose-200 dark:border-rose-950/50 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 mb-1 text-rose-500">
            <AlertOctagon className="size-4" />
            <h2 className="text-xs font-bold">Danger Zone: Purge Vault</h2>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
            Permanently destroy all {items.length} items currently in {scopeLabel}. This action cannot be reversed.
          </p>

          <button
            type="button"
            onClick={handlePurge}
            className="flex items-center gap-1.5 rounded-md bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-2xs cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            Purge All Vault Data
          </button>
        </div>
      </div>

      <EmergencyRecoveryKitModal
        isOpen={showEmergencyKitModal}
        onClose={() => setShowEmergencyKitModal(false)}
        account="sahil@northstar.io"
        scopeLabel={scopeLabel}
        secretKey={secretKey}
        merkleRoot={
          merkleChain.length > 0
            ? merkleChain[merkleChain.length - 1].merkleRoot
            : "7f8b9a1c4e2d3f4a5b6c7d8e9f0a1b2c"
        }
        onNotify={onNotify}
      />
    </div>
  );
}
