"use client";

import { useState } from "react";
import {
  AlignJustify,
  Clipboard,
  Fingerprint,
  KeyRound,
  Lock,
  Palette,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { AccentColor, ThemeMode, UiDensity, VaultSettings } from "@/types/vault";

interface SettingsViewProps {
  settings: VaultSettings;
  onUpdateSettings: (updates: Partial<VaultSettings>) => void;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  onChangeMasterPassphrase: (newPass: string) => void;
  onNotify: (msg: string) => void;
}

export function SettingsView({
  settings,
  onUpdateSettings,
  theme,
  onToggleTheme,
  onChangeMasterPassphrase,
  onNotify,
}: SettingsViewProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassphrase, setNewPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [hint, setHint] = useState(settings.masterPasswordHint);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassphrase.length < 6) {
      onNotify("Master password must be at least 6 characters");
      return;
    }
    if (newPassphrase !== confirmPassphrase) {
      onNotify("Passwords do not match");
      return;
    }

    onChangeMasterPassphrase(newPassphrase);
    onUpdateSettings({ masterPasswordHint: hint });
    setShowPasswordModal(false);
    setNewPassphrase("");
    setConfirmPassphrase("");
    onNotify("Master password and hint updated successfully");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-app)] p-4 sm:p-6 md:p-8 select-none">
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">
            Vault Preferences & Security Settings
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Configure local vault timeouts, clipboard security, master credentials, density, and biometric unlocking.
          </p>
        </div>

        {/* UI DENSITY & LAYOUT SECTION */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlignJustify className="size-4 text-blue-500" />
            <h2 className="text-xs font-bold text-[var(--text-primary)]">
              Interface Information Density
            </h2>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Adjust spacing and row height across lists, items, and detail panes to see more credentials on screen.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "comfortable" as UiDensity,
                title: "Comfortable Density",
                desc: "Spacious layout with generous spacing and relaxed paddings.",
              },
              {
                id: "compact" as UiDensity,
                title: "Compact Density",
                desc: "Tight row heights, high information density, and reduced padding.",
              },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  onUpdateSettings({ density: d.id });
                  onNotify(`Density set to ${d.title}`);
                }}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  (settings.density || "comfortable") === d.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-[var(--border-strong)]"
                }`}
              >
                <b className={`block text-xs font-bold ${
                  (settings.density || "comfortable") === d.id ? "text-blue-500" : "text-[var(--text-primary)]"
                }`}>
                  {d.title}
                </b>
                <small className="block text-[11px] text-[var(--text-muted)] mt-1">
                  {d.desc}
                </small>
              </button>
            ))}
          </div>
        </div>

        {/* VAULT TIMEOUT & LOCK SECTION */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="size-4 text-blue-500" />
            <h2 className="text-xs font-bold text-[var(--text-primary)]">
              Vault Timeout & Session Security
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Vault Timeout
              </label>
              <select
                value={settings.vaultTimeout}
                onChange={(e) =>
                  onUpdateSettings({
                    vaultTimeout: e.target.value as VaultSettings["vaultTimeout"],
                  })
                }
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
              >
                <option value="immediate">Immediately upon closing</option>
                <option value="1min">1 Minute</option>
                <option value="5min">5 Minutes</option>
                <option value="15min">15 Minutes (Recommended)</option>
                <option value="1hour">1 Hour</option>
                <option value="never">Never (Not recommended)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                Vault Timeout Action
              </label>
              <select
                value={settings.vaultTimeoutAction}
                onChange={(e) =>
                  onUpdateSettings({
                    vaultTimeoutAction: e.target.value as VaultSettings["vaultTimeoutAction"],
                  })
                }
                className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
              >
                <option value="lock">Lock Vault (Requires Passphrase)</option>
                <option value="logout">Log Out Session</option>
              </select>
            </div>
          </div>

          {/* Privacy Blur Shield Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Shield className="size-4 text-blue-500" />
              <div>
                <b className="block text-xs font-semibold text-[var(--text-primary)]">
                  Privacy Shield (Mask on Inactive Window)
                </b>
                <small className="text-[11px] text-[var(--text-muted)]">
                  Instantly blur and mask credential details when switching away from Vaultwise.
                </small>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.enablePrivacyBlur !== false}
              onChange={(e) => onUpdateSettings({ enablePrivacyBlur: e.target.checked })}
              className="size-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Biometrics Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <Fingerprint className="size-4 text-blue-500" />
              <div>
                <b className="block text-xs font-semibold text-[var(--text-primary)]">
                  Unlock with Biometrics (Touch ID / Windows Hello)
                </b>
                <small className="text-[11px] text-[var(--text-muted)]">
                  Use hardware biometric enclave for instant local vault unlock.
                </small>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.biometricsEnabled}
              onChange={(e) => onUpdateSettings({ biometricsEnabled: e.target.checked })}
              className="size-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* CLIPBOARD SECURITY */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Clipboard className="size-4 text-blue-500" />
            <h2 className="text-xs font-bold text-[var(--text-primary)]">
              Clipboard Protection
            </h2>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
              Clear Clipboard Automatically
            </label>
            <select
              value={settings.clearClipboardDelay}
              onChange={(e) =>
                onUpdateSettings({ clearClipboardDelay: Number(e.target.value) })
              }
              className="w-full sm:w-80 rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="10">After 10 seconds</option>
              <option value="20">After 20 seconds</option>
              <option value="30">After 30 seconds (Default)</option>
              <option value="60">After 60 seconds</option>
              <option value="0">Never</option>
            </select>
            <small className="block mt-1 text-[11px] text-[var(--text-muted)]">
              Clears passwords from system memory so other applications cannot read copied credentials.
            </small>
          </div>
        </div>

        {/* ACCENT COLOR & THEME PREFERENCES */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="size-4 text-blue-500" />
            <h2 className="text-xs font-bold text-[var(--text-primary)]">Accent Colors & Theme</h2>
          </div>

          {/* Accent Color Palette Selector */}
          <div>
            <span className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-2">
              Primary Accent Color
            </span>
            <div className="flex items-center gap-2.5">
              {[
                { id: "blue" as AccentColor, label: "Vaultwise Blue", color: "bg-blue-600" },
                { id: "emerald" as AccentColor, label: "Cyber Emerald", color: "bg-emerald-600" },
                { id: "violet" as AccentColor, label: "Nebula Violet", color: "bg-violet-600" },
                { id: "rose" as AccentColor, label: "Crimson Rose", color: "bg-rose-600" },
                { id: "amber" as AccentColor, label: "Gold Amber", color: "bg-amber-600" },
              ].map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ accentColor: acc.id });
                    onNotify(`Accent color set to ${acc.label}`);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    (settings.accentColor || "blue") === acc.id
                      ? "border-slate-400 bg-[var(--bg-app)] font-bold shadow-2xs"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]"
                  }`}
                  title={acc.label}
                >
                  <span className={`size-3 rounded-full ${acc.color}`} />
                  <span className="text-[11px] text-[var(--text-primary)]">{acc.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[var(--border-subtle)]">
            {[
              { id: "system" as ThemeMode, label: "System Default" },
              { id: "dark" as ThemeMode, label: "Dark Mode" },
              { id: "light" as ThemeMode, label: "Light Mode" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleTheme(t.id)}
                className={`rounded-lg border p-2.5 text-center text-xs font-medium transition cursor-pointer ${
                  theme === t.id
                    ? "border-blue-500 bg-blue-500/10 font-bold text-blue-500"
                    : "border-[var(--border-subtle)] bg-[var(--bg-app)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CRYPTOGRAPHIC SECURITY DIAGNOSTICS */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <h2 className="text-xs font-bold text-[var(--text-primary)]">
              Cryptographic Enclave Status
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
            <div className="p-2 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">CIPHER</span>
              <b className="text-emerald-500">AES-256-GCM</b>
            </div>
            <div className="p-2 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">KDF WORK FACTOR</span>
              <b className="text-[var(--text-primary)]">PBKDF2 600K</b>
            </div>
            <div className="p-2 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">ENTROPY SHIELD</span>
              <b className="text-violet-500">128-Bit Secret Key</b>
            </div>
            <div className="p-2 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] block">LEDGER INTEGRITY</span>
              <b className="text-blue-500">Merkle Blockchain</b>
            </div>
          </div>
        </div>

        {/* MASTER PASSWORD & HINT */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-blue-500" />
              <h2 className="text-xs font-bold text-[var(--text-primary)]">
                Master Password & Key Recovery
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition cursor-pointer"
            >
              Change Master Password
            </button>
          </div>

          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-app)] p-2.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-0.5">
              Active Password Hint
            </span>
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              {settings.masterPasswordHint || "No hint configured"}
            </span>
          </div>
        </div>
      </div>

      {/* CHANGE MASTER PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              Change Master Password
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Your master password is never stored on servers. Make sure to remember it.
            </p>

            <form onSubmit={handleSavePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  New Master Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassphrase}
                  onChange={(e) => setNewPassphrase(e.target.value)}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">
                  Master Password Hint
                </label>
                <input
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="e.g. Favorite childhood street"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-md border border-[var(--border-subtle)] px-3 py-1.5 text-xs text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700"
                >
                  Update Passphrase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
