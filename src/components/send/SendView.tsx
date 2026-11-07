"use client";

import { useState } from "react";
import {
  Copy,
  Eye,
  FileUp,
  Lock,
  Plus,
  Search,
  Send,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { VaultSend } from "@/types/vault";
import { useVaultSend } from "@/hooks/useVaultSend";
import { useContextMenu } from "@/context/ContextMenuContext";
import { copySensitiveText, copyTextSafely } from "@/lib/clipboard";

interface SendViewProps {
  onNotify: (msg: string) => void;
}

export function SendView({ onNotify }: SendViewProps) {
  const { sends, createSend, deleteSend, incrementAccessCount } =
    useVaultSend();
  const { openContextMenu } = useContextMenu();

  const [isCreating, setIsCreating] = useState(false);
  const [recipientSend, setRecipientSend] = useState<VaultSend | null>(null);
  const [recipientPasswordInput, setRecipientPasswordInput] = useState("");
  const [recipientRevealed, setRecipientRevealed] = useState(false);
  const [recipientError, setRecipientError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "protected">("all");

  // New send form state
  const [sendType, setSendType] = useState<"text" | "file">("text");
  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [expiry, setExpiry] = useState("7 days");
  const [maxAccess, setMaxAccess] = useState<number | undefined>(5);
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (sendType === "text" && !text.trim()) return;
    if (sendType === "file" && !fileName.trim()) return;

    createSend({
      name: name.trim(),
      type: sendType,
      text: sendType === "text" ? text.trim() : `Encrypted payload attached: ${fileName}`,
      fileName: sendType === "file" ? fileName : undefined,
      fileSize: sendType === "file" ? "14.2 KB" : undefined,
      expiresAt: `In ${expiry}`,
      maxAccessCount: maxAccess,
      password: password.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setIsCreating(false);
    setName("");
    setText("");
    setFileName("");
    setPassword("");
    setNotes("");
    onNotify(sendType === "file" ? "Encrypted File Send created" : "Encrypted Send created successfully");
  };

  const handleCopyLink = async (send: VaultSend) => {
    const fakeLink = `https://vaultwise.local/send#${send.id}`;
    const ok = await copyTextSafely(fakeLink);
    if (ok) {
      onNotify("Send link copied to clipboard");
    } else {
      onNotify("Failed to copy Send link");
    }
  };

  const openRecipientModal = (send: VaultSend) => {
    setRecipientSend(send);
    setRecipientPasswordInput("");
    setRecipientRevealed(false);
    setRecipientError(false);
  };

  const handleRecipientAccess = () => {
    if (!recipientSend) return;

    if (recipientSend.password && recipientPasswordInput !== recipientSend.password) {
      setRecipientError(true);
      return;
    }

    setRecipientRevealed(true);
    incrementAccessCount(recipientSend.id);
    onNotify("Decrypted transmission (Access count registered)");
  };

    const filteredSends = sends.filter((s) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(query) ||
        (s.notes && s.notes.toLowerCase().includes(query));
      if (!matchesSearch) return false;
      if (filterTab === "protected") return Boolean(s.password);
      if (filterTab === "active") return !s.disabled;
      return true;
    });

    return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-app)] p-4 sm:p-6 md:p-8 select-none">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Vaultwise Send
              </h1>
              <span className="rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold">
                EPHEMERAL ENCRYPTION
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Transmit secrets, API keys, or confidential notes with end-to-end encryption, max view burn, and expiration.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--accent-primary)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[var(--accent-hover)] transition shrink-0 cursor-pointer"
          >
            <Plus className="size-3.5" />
            New Send
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 w-full sm:w-72 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 text-[var(--text-muted)] focus-within:border-blue-500">
            <Search className="size-3.5 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter transmissions..."
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-subtle)] shrink-0">
            {[
              { id: "all" as const, label: `All (${sends.length})` },
              { id: "active" as const, label: "Active" },
              { id: "protected" as const, label: "Passphrase Protected" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterTab(f.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  filterTab === f.id
                    ? "bg-slate-800 text-white font-semibold shadow-2xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Send Items List */}
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openContextMenu(
              e,
              [
                {
                  id: "new-send",
                  label: "Create New Send",
                  icon: Plus,
                  shortcut: "⌘N",
                  onClick: () => setIsCreating(true),
                },
              ],
              {
                title: "Vaultwise Send",
                subtitle: "Ephemeral Transmissions",
              }
            );
          }}
          className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xs"
        >
          <div className="grid grid-cols-[1.5fr_100px_110px_140px] gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            <span>Transmission Name</span>
            <span>Access Count</span>
            <span>Expiration</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {filteredSends.map((send) => (
              <div
                key={send.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openContextMenu(
                    e,
                    [
                      {
                        id: "copy-link",
                        label: "Copy Send Link",
                        icon: Copy,
                        onClick: () => handleCopyLink(send),
                      },
                      {
                        id: "simulate-access",
                        label: "Simulate Recipient View",
                        icon: Eye,
                        onClick: () => openRecipientModal(send),
                      },
                      { type: "divider" },
                      {
                        id: "new-send",
                        label: "Create New Send",
                        icon: Plus,
                        shortcut: "⌘N",
                        onClick: () => setIsCreating(true),
                      },
                      { type: "divider" },
                      {
                        id: "delete-send",
                        label: "Delete Send",
                        icon: Trash2,
                        danger: true,
                        onClick: () => {
                          if (confirm(`Delete transmission "${send.name}"?`)) {
                            deleteSend(send.id);
                            onNotify("Encrypted Send deleted");
                          }
                        },
                      },
                    ],
                    {
                      title: send.name,
                      subtitle: `Expires: ${send.expiresAt}`,
                    }
                  );
                }}
                className="grid grid-cols-[1.5fr_100px_110px_140px] items-center gap-4 px-4 py-3.5 text-xs hover:bg-[var(--bg-hover)] transition cursor-context-menu"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid size-8 place-items-center rounded-lg bg-blue-600/10 text-blue-500 shrink-0">
                    <Send className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <b className="block truncate font-semibold text-[var(--text-primary)]">
                      {send.name}
                    </b>
                    <div className="flex items-center gap-2 mt-0.5">
                      {send.password && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-500">
                          <Lock className="size-2.5" /> Passphrase protected
                        </span>
                      )}
                      {send.notes && (
                        <small className="text-[10px] text-[var(--text-muted)] truncate max-w-xs">
                          {send.notes}
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-mono text-xs text-[var(--text-secondary)]">
                    {send.accessCount} / {send.maxAccessCount ? send.maxAccessCount : "∞"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {send.expiresAt}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(send)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                    title="Copy Shareable Link"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openRecipientModal(send)}
                    className="p-1 text-[var(--accent-primary)] hover:underline text-[11px] font-semibold"
                    title="Test Recipient View"
                  >
                    Simulate
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSend(send.id)}
                    className="p-1 text-[var(--text-muted)] hover:text-rose-500 transition"
                    title="Delete Send"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {sends.length === 0 && (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                No active sends. Create one to securely share passwords or tokens.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create New Send Dialog */}
      {isCreating && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Create Encrypted Send
              </h2>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              {/* Send Type Selector (Text vs File) */}
              <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSendType("text")}
                  className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1.5 ${
                    sendType === "text"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Send className="size-3" />
                  Text Secret
                </button>
                <button
                  type="button"
                  onClick={() => setSendType("file")}
                  className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1.5 ${
                    sendType === "file"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <FileUp className="size-3" />
                  Encrypted File
                </button>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Transmission Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Database Password"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none focus:border-blue-500"
                />
              </div>

              {sendType === "text" ? (
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Secret Text to Encrypt</label>
                  <textarea
                    required
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste passwords, private keys, or tokens here..."
                    className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">File Attachment (End-to-End Encrypted)</label>
                  <input
                    required
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. secret_key.pem, credentials.json, id_rsa"
                    className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-blue-500"
                  />
                  <small className="block text-[10px] text-[var(--text-muted)]">
                    Simulates browser-side client AES-256 encryption before uploading file chunk bytes.
                  </small>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Deletion Expiry</label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value="1 hour">1 Hour</option>
                    <option value="1 day">1 Day</option>
                    <option value="7 days">7 Days</option>
                    <option value="30 days">30 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Maximum Views</label>
                  <select
                    value={maxAccess === undefined ? "0" : maxAccess.toString()}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxAccess(val === 0 ? undefined : val);
                    }}
                    className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value="1">1 View (Burn on Read)</option>
                    <option value="5">5 Views</option>
                    <option value="10">10 Views</option>
                    <option value="0">Unlimited</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Optional Access Passphrase
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Recipient must enter this passphrase to decrypt"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Internal Note</label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional reference for yourself"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700"
                >
                  Create Encrypted Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipient Simulation Modal */}
      {recipientSend && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl text-center">
            <div className="mx-auto mb-3 grid size-10 place-items-center rounded-lg bg-blue-600/10 text-blue-500">
              <Shield className="size-5" />
            </div>

            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {recipientSend.name}
            </h3>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              This transmission expires {recipientSend.expiresAt.toLowerCase()} or after reaching view limit.
            </p>

            {/* If password protected and not yet revealed */}
            {recipientSend.password && !recipientRevealed && (
              <div className="mt-4 space-y-2">
                <input
                  type="password"
                  value={recipientPasswordInput}
                  onChange={(e) => {
                    setRecipientPasswordInput(e.target.value);
                    setRecipientError(false);
                  }}
                  placeholder="Enter required passphrase"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-center text-xs text-[var(--text-primary)] outline-none"
                />
                {recipientError && (
                  <p className="text-[11px] text-rose-500">Incorrect password.</p>
                )}
                <button
                  type="button"
                  onClick={handleRecipientAccess}
                  className="w-full rounded-md bg-blue-600 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700"
                >
                  Decrypt Content
                </button>
              </div>
            )}

            {/* If not password protected and not yet revealed */}
            {!recipientSend.password && !recipientRevealed && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleRecipientAccess}
                  className="w-full rounded-md bg-blue-600 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700"
                >
                  Decrypt Transmission
                </button>
              </div>
            )}

            {/* Revealed Text Content */}
            {recipientRevealed && (
              <div className="mt-4 text-left">
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--code-bg)] p-3">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                    <span>Decrypted Payload</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await copySensitiveText(recipientSend.text || "", "Secret payload", undefined, onNotify);
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-[var(--text-primary)] whitespace-pre-wrap select-all">
                    {recipientSend.text}
                  </pre>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setRecipientSend(null)}
              className="mt-5 text-xs text-[var(--text-muted)] hover:underline"
            >
              Close Recipient View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
