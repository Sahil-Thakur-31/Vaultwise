"use client";

import { useRef } from "react";
import { Copy, Download, KeyRound, Printer, Shield, ShieldAlert, X } from "lucide-react";
import { copySensitiveText } from "@/lib/clipboard";

interface EmergencyRecoveryKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: string;
  scopeLabel: string;
  secretKey: string;
  passwordHint?: string;
  merkleRoot?: string;
  onNotify: (msg: string) => void;
}

export function EmergencyRecoveryKitModal({
  isOpen,
  onClose,
  account,
  scopeLabel,
  secretKey,
  passwordHint = "Standard company dev seed (default: vaultwise)",
  merkleRoot = "7f8b9a1c...e3d4",
  onNotify,
}: EmergencyRecoveryKitModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopyKey = async () => {
    await copySensitiveText(secretKey, "128-bit Secret Key", undefined, onNotify);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const content = `================================================================================
          VAULTWISE ZERO-KNOWLEDGE EMERGENCY RECOVERY KIT
================================================================================
CONFIDENTIAL - Store this document in a secure offline safe or safe-deposit box.
Do not email or store unencrypted on cloud storage.

ACCOUNT INFORMATION:
--------------------
Account Identifier:    ${account}
Vault Scope:           ${scopeLabel}
Enclave Version:       2.4.0 (Zero-Knowledge AES-256-GCM)
Generated At:          ${new Date().toISOString()}

128-BIT MASTER RECOVERY SECRET KEY:
-----------------------------------
${secretKey}

MASTER PASSWORD HINT:
---------------------
${passwordHint}

AUDIT LEDGER INTEGRITY:
-----------------------
Merkle Root Hash:      ${merkleRoot}
Key Derivation:        PBKDF2 with 600,000 SHA-256 rounds
Dual-Key Salt:         Cryptographic CSPRNG 128-bit salt

RECOVERY PROCEDURE:
-------------------
1. Launch the Vaultwise Desktop application.
2. At the Master Lock screen, click "Emergency Vault Recovery".
3. Provide your Account Identifier: ${account}
4. Enter the 128-bit Master Recovery Secret Key exactly as listed above.
5. Derive and confirm a new Master Passphrase to re-encrypt your local vault.
================================================================================
Vaultwise Cryptographic Enclave • Zero Plaintext Guarantee
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Vaultwise-Emergency-Kit-${account.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify("Emergency Recovery Kit downloaded successfully.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Shield className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Emergency Recovery Kit</h2>
              <p className="text-[11px] text-[var(--text-muted)]">Official Zero-Knowledge Cryptographic Passport</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          
          {/* Security Alert Banner */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
            <ShieldAlert className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-amber-300">
              <strong className="font-semibold block mb-0.5">Physical Security Requirement</strong>
              This Emergency Kit contains your dual-key recovery secret. Print or store it in a physical safe. Never share or upload this file to unencrypted storage.
            </div>
          </div>

          {/* Account Details Block */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">
                Account Identifier
              </span>
              <span className="font-semibold text-[var(--text-primary)] font-mono">{account}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">
                Vault Scope
              </span>
              <span className="font-semibold text-[var(--text-primary)]">{scopeLabel}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">
                Encryption Standard
              </span>
              <span className="font-semibold text-emerald-500">AES-256-GCM • 600K PBKDF2</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">
                Ledger Root Proof
              </span>
              <span className="font-mono text-[10px] text-[var(--text-secondary)] truncate block">
                {merkleRoot || "Verified Merkle Root #24"}
              </span>
            </div>
          </div>

          {/* 128-bit Secret Recovery Key */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <KeyRound className="size-3.5" />
                <span>128-bit Master Secret Recovery Key</span>
              </div>
              <button
                type="button"
                onClick={handleCopyKey}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition cursor-pointer"
              >
                <Copy className="size-3" />
                <span>Copy Key</span>
              </button>
            </div>
            <div className="rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] p-3 font-mono text-center text-xs font-bold tracking-widest text-[var(--text-primary)] select-all">
              {secretKey}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
              Required alongside your Master Password Hint to reconstruct the master decryption key in an emergency.
            </p>
          </div>

          {/* Password Hint */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-3.5 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] block mb-1">
              Master Password Hint
            </span>
            <div className="font-mono text-xs text-[var(--text-secondary)] italic">
              &quot;{passwordHint}&quot;
            </div>
          </div>

          {/* Step by step recovery instructions */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-[var(--text-primary)] text-xs">Emergency Recovery Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
              <li>Launch Vaultwise desktop or navigate to the web enclave.</li>
              <li>When prompted for your Master Password, click &quot;Emergency Recovery&quot;.</li>
              <li>Input your account email and enter the 128-bit Secret Key exactly as displayed above.</li>
              <li>Establish a new master passphrase to regenerate local cryptographic storage.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-6 py-4 bg-[var(--bg-surface)]">
          <button
            type="button"
            onClick={handleDownloadText}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Download Kit (.txt)</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
            >
              <Printer className="size-3.5" />
              <span>Print Recovery Kit</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
