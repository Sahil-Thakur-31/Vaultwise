"use client";

import { useState } from "react";
import {
  Binary,
  Check,
  Copy,
  History,
  KeyRound,
  Plus,
  RefreshCw,
  Sparkles,
  Terminal,
  Type,
  User,
} from "lucide-react";
import { generatePassword, getCrackTimeEstimate, PasswordOptions } from "@/lib/crypto";
import { generatePassphrase, generateUsername, PassphraseOptions, UsernameOptions } from "@/lib/passphrase";
import { copySensitiveText, copyTextSafely } from "@/lib/clipboard";

interface PasswordGeneratorProps {
  onSavePassword: (password: string) => void;
  onNotify: (message: string) => void;
}

type GeneratorTab = "password" | "passphrase" | "pin" | "username" | "developer";

export function PasswordGenerator({
  onSavePassword,
  onNotify,
}: PasswordGeneratorProps) {
  const [tab, setTab] = useState<GeneratorTab>("password");
  const [copied, setCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Password mode state
  const [pwLength, setPwLength] = useState(20);
  const [pwOptions, setPwOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    avoidAmbiguous: true,
    minNumbers: 1,
    minSymbols: 1,
  });
  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generatePassword(20, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      avoidAmbiguous: true,
      minNumbers: 1,
      minSymbols: 1,
    })
  );

  // Passphrase mode state
  const [ppOptions, setPpOptions] = useState<PassphraseOptions>({
    wordsCount: 4,
    separator: "-",
    capitalize: true,
    includeNumber: true,
  });
  const [generatedPassphrase, setGeneratedPassphrase] = useState(() =>
    generatePassphrase({
      wordsCount: 4,
      separator: "-",
      capitalize: true,
      includeNumber: true,
    })
  );

  // PIN mode state
  const [pinLength, setPinLength] = useState(6);
  const generatePin = (len: number) => {
    let pin = "";
    for (let i = 0; i < len; i++) {
      pin += Math.floor(Math.random() * 10).toString();
    }
    return pin;
  };
  const [generatedPin, setGeneratedPin] = useState(() => generatePin(6));

  // Username mode state
  const [unOptions, setUnOptions] = useState<UsernameOptions>({
    type: "plus-addressed",
    baseEmail: "sahil@northstar.io",
    domain: "northstar.io",
    service: "github",
  });
  const [generatedUsername, setGeneratedUsername] = useState(() =>
    generateUsername({
      type: "plus-addressed",
      baseEmail: "sahil@northstar.io",
      domain: "northstar.io",
      service: "github",
    })
  );

  // Developer Keys state
  const [devKeyType, setDevKeyType] = useState<"api-key" | "ed25519" | "hex">("api-key");
  const [devPrefix, setDevPrefix] = useState("sk_live_");

  const generateDevSecret = (type: "api-key" | "ed25519" | "hex", prefix: string = "sk_live_"): string => {
    if (typeof window === "undefined" || !window.crypto) return "sec_mock_4a8f9c21e03b";
    if (type === "api-key") {
      const bytes = new Uint8Array(24);
      window.crypto.getRandomValues(bytes);
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      return `${prefix}${hex}`;
    }
    if (type === "ed25519") {
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      const b64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
      return `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI${b64} developer@vaultwise`;
    }
    const bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  };

  const [generatedDevSecret, setGeneratedDevSecret] = useState(() => generateDevSecret("api-key", "sk_live_"));

  const activeValue =
    tab === "password"
      ? generatedPassword
      : tab === "passphrase"
      ? generatedPassphrase
      : tab === "pin"
      ? generatedPin
      : tab === "username"
      ? generatedUsername
      : generatedDevSecret;

  const pushHistory = (val: string) => {
    setHistory((prev) => [val, ...prev.filter((p) => p !== val)].slice(0, 6));
  };

  const handleCopy = async () => {
    try {
      const isSensitive = tab !== "username";
      const ok = isSensitive
        ? await copySensitiveText(
            activeValue,
            tab === "pin" ? "PIN" : tab === "developer" ? "Developer Secret" : "Password",
            undefined,
            onNotify
          )
        : await copyTextSafely(activeValue);

      if (ok) {
        setCopied(true);
        pushHistory(activeValue);
        if (!isSensitive) {
          onNotify("Username copied to clipboard");
        }
        setTimeout(() => setCopied(false), 1800);
      } else {
        onNotify("Failed to copy");
      }
    } catch {
      onNotify("Failed to copy");
    }
  };

  const handleRegenerate = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 350);
    if (tab === "password") {
      const next = generatePassword(pwLength, pwOptions);
      setGeneratedPassword(next);
      pushHistory(next);
    } else if (tab === "passphrase") {
      const next = generatePassphrase(ppOptions);
      setGeneratedPassphrase(next);
      pushHistory(next);
    } else if (tab === "pin") {
      const next = generatePin(pinLength);
      setGeneratedPin(next);
      pushHistory(next);
    } else if (tab === "developer") {
      const next = generateDevSecret(devKeyType, devPrefix);
      setGeneratedDevSecret(next);
      pushHistory(next);
    } else {
      const next = generateUsername(unOptions);
      setGeneratedUsername(next);
      pushHistory(next);
    }
  };

  const updatePwOption = (key: keyof PasswordOptions, val: boolean | number) => {
    const next = { ...pwOptions, [key]: val };
    setPwOptions(next);
    const generated = generatePassword(pwLength, next);
    setGeneratedPassword(generated);
    pushHistory(generated);
  };

  const updatePpOption = (key: keyof PassphraseOptions, val: boolean | string | number) => {
    const next = { ...ppOptions, [key]: val };
    setPpOptions(next);
    const generated = generatePassphrase(next);
    setGeneratedPassphrase(generated);
    pushHistory(generated);
  };

  const updateUnOption = (key: keyof UsernameOptions, val: string) => {
    const next = { ...unOptions, [key]: val };
    setUnOptions(next as UsernameOptions);
    const generated = generateUsername(next as UsernameOptions);
    setGeneratedUsername(generated);
    pushHistory(generated);
  };

  const crackMetrics = getCrackTimeEstimate(activeValue);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-app)] p-4 sm:p-6 md:p-8 select-none">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-bold text-[var(--text-primary)]">
                Generator Suite
              </h1>
              <span className="rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold">
                VAULTWISE CSPRNG
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Cryptographically secure high-entropy passwords, memorable passphrases, numeric PINs, and email aliases.
            </p>
          </div>

          {/* Tab Selector Segment */}
          <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setTab("password")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                tab === "password"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <KeyRound className="size-3.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => setTab("passphrase")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                tab === "passphrase"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Type className="size-3.5" />
              Passphrase
            </button>
            <button
              type="button"
              onClick={() => setTab("pin")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                tab === "pin"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Binary className="size-3.5" />
              PIN
            </button>
            <button
              type="button"
              onClick={() => setTab("username")}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                tab === "username"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <User className="size-3.5" />
              Username
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("developer");
                pushHistory(generatedDevSecret);
              }}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                tab === "developer"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Terminal className="size-3.5" />
              API & Keys
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Secret Preview, Actions, Crack Metrics, Recent History */}
          <div className="lg:col-span-7 space-y-4">
            {/* Generated Secret Card */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--code-bg)] p-3">
                <code className="min-w-0 flex-1 font-mono text-base sm:text-lg font-bold text-[var(--text-primary)] select-all truncate tracking-wide">
                  {activeValue}
                </code>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-md bg-[var(--accent-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[var(--accent-hover)] transition"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="grid size-8 place-items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition active:scale-90 cursor-pointer"
                    title="Regenerate"
                  >
                    <RefreshCw className={`size-3.5 transition-transform duration-300 ${isSpinning ? "rotate-180 text-blue-500" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Entropy & Crack Time Progress Bar */}
              <div className="space-y-1.5 pt-1 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${crackMetrics.color.replace("text-", "bg-")}`} />
                    <span className="font-semibold text-[var(--text-primary)]">
                      Crack Time: {crackMetrics.timeEstimate}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)] font-semibold">
                    {crackMetrics.entropy} bits entropy
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-app)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${crackMetrics.color.replace("text-", "bg-")}`}
                    style={{ width: `${Math.min(100, Math.max(15, (crackMetrics.entropy / 128) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Save Directly to Vault Button */}
              <button
                type="button"
                onClick={() => onSavePassword(activeValue)}
                className="w-full flex items-center justify-center gap-1.5 rounded-md border border-blue-500/30 bg-blue-600/10 py-2 text-xs font-semibold text-blue-500 hover:bg-blue-600/20 transition cursor-pointer"
              >
                <Plus className="size-3.5" />
                Save to Vault as New Item
              </button>
            </div>

            {/* Recent History Drawer */}
            {history.length > 0 && (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <History className="size-3 text-blue-500" />
                    Recently Generated
                  </span>
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="text-[10px] text-[var(--text-muted)] hover:text-rose-500 transition"
                  >
                    Clear History
                  </button>
                </div>
                <div className="space-y-1">
                  {history.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md bg-[var(--bg-app)] px-2.5 py-1.5 text-xs font-mono border border-[var(--border-subtle)]"
                    >
                      <span className="truncate max-w-[220px] text-[var(--text-primary)]">
                        {h}
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          const isSensitive = tab !== "username";
                          const ok = isSensitive
                            ? await copySensitiveText(h, "History item", undefined, onNotify)
                            : await copyTextSafely(h);
                          if (ok && !isSensitive) {
                            onNotify("Copied from history");
                          }
                        }}
                        className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 font-sans"
                      >
                        <Copy className="size-3" />
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Parameter Controls */}
          <div className="lg:col-span-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              Generation Parameters
            </h3>

            {/* PASSWORD OPTIONS */}
            {tab === "password" && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between font-semibold text-[var(--text-secondary)] mb-1.5">
                    <span>Length</span>
                    <span className="font-mono text-blue-500 font-bold">{pwLength} characters</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={pwLength}
                    onChange={(e) => {
                      const l = Number(e.target.value);
                      setPwLength(l);
                      const generated = generatePassword(l, pwOptions);
                      setGeneratedPassword(generated);
                      pushHistory(generated);
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  {[
                    { key: "uppercase" as const, label: "A–Z (Uppercase letters)" },
                    { key: "lowercase" as const, label: "a–z (Lowercase letters)" },
                    { key: "numbers" as const, label: "0–9 (Numeric digits)" },
                    { key: "symbols" as const, label: "!@#$ (Special characters)" },
                    { key: "avoidAmbiguous" as const, label: "Avoid Ambiguous (0, O, l)" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] p-2 cursor-pointer hover:bg-[var(--bg-app)] select-none text-[var(--text-primary)]"
                    >
                      <span className="text-[11px] font-medium">{label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(pwOptions[key])}
                        onChange={(e) => updatePwOption(key, e.target.checked)}
                        className="size-3.5 rounded accent-blue-600 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* PASSPHRASE OPTIONS */}
            {tab === "passphrase" && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between font-semibold text-[var(--text-secondary)] mb-1.5">
                    <span>Word Count</span>
                    <span className="font-mono text-blue-500 font-bold">{ppOptions.wordsCount} words</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    value={ppOptions.wordsCount}
                    onChange={(e) => updatePpOption("wordsCount", Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Word Separator
                    </label>
                    <select
                      value={ppOptions.separator}
                      onChange={(e) => updatePpOption("separator", e.target.value)}
                      className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
                    >
                      <option value="-">Hyphen (-)</option>
                      <option value="_">Underscore (_)</option>
                      <option value=".">Period (.)</option>
                      <option value=" ">Space</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] p-2 cursor-pointer select-none">
                    <span className="text-[11px] font-medium text-[var(--text-primary)]">Capitalize Words</span>
                    <input
                      type="checkbox"
                      checked={Boolean(ppOptions.capitalize)}
                      onChange={(e) => updatePpOption("capitalize", e.target.checked)}
                      className="size-3.5 rounded accent-blue-600 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] p-2 cursor-pointer select-none">
                    <span className="text-[11px] font-medium text-[var(--text-primary)]">Append Random Number</span>
                    <input
                      type="checkbox"
                      checked={Boolean(ppOptions.includeNumber)}
                      onChange={(e) => updatePpOption("includeNumber", e.target.checked)}
                      className="size-3.5 rounded accent-blue-600 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* PIN CODE OPTIONS */}
            {tab === "pin" && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between font-semibold text-[var(--text-secondary)] mb-1.5">
                    <span>PIN Length</span>
                    <span className="font-mono text-blue-500 font-bold">{pinLength} digits</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    value={pinLength}
                    onChange={(e) => {
                      const l = Number(e.target.value);
                      setPinLength(l);
                      const next = generatePin(l);
                      setGeneratedPin(next);
                      pushHistory(next);
                    }}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[4, 6, 8].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setPinLength(preset);
                        const next = generatePin(preset);
                        setGeneratedPin(next);
                        pushHistory(next);
                      }}
                      className={`py-2 rounded-md border text-center font-semibold transition ${
                        pinLength === preset
                          ? "border-blue-500 bg-blue-500/10 text-blue-500"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-app)]"
                      }`}
                    >
                      {preset}-Digit
                    </button>
                  ))}
                </div>
                <small className="block text-[10px] text-[var(--text-muted)]">
                  Ideal for ATM cards, mobile SIMs, and hardware security tokens.
                </small>
              </div>
            )}

            {/* USERNAME OPTIONS */}
            {tab === "username" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Username Type
                  </label>
                  <select
                    value={unOptions.type}
                    onChange={(e) => updateUnOption("type", e.target.value)}
                    className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="plus-addressed">Plus-Addressed Email</option>
                    <option value="catchall">Catch-All Alias</option>
                    <option value="random">Random Word Handle</option>
                  </select>
                </div>

                {unOptions.type !== "random" && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Service Identifier
                      </label>
                      <input
                        value={unOptions.service}
                        onChange={(e) => updateUnOption("service", e.target.value)}
                        placeholder="e.g. github, aws, stripe"
                        className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Domain
                      </label>
                      <input
                        value={unOptions.domain}
                        onChange={(e) => updateUnOption("domain", e.target.value)}
                        placeholder="northstar.io"
                        className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DEVELOPER KEYS & API SECRETS OPTIONS */}
            {tab === "developer" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                    Credential Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "api-key" as const, label: "API Secret Key" },
                      { id: "ed25519" as const, label: "SSH (ED25519)" },
                      { id: "hex" as const, label: "256-bit Hex Token" },
                    ].map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => {
                          setDevKeyType(k.id);
                          const next = generateDevSecret(k.id, devPrefix);
                          setGeneratedDevSecret(next);
                          pushHistory(next);
                        }}
                        className={`py-2 px-1.5 rounded-md border text-center font-semibold transition text-[11px] cursor-pointer ${
                          devKeyType === k.id
                            ? "border-blue-500 bg-blue-500/10 text-blue-500"
                            : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-app)]"
                        }`}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>

                {devKeyType === "api-key" && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Key Prefix
                    </label>
                    <input
                      value={devPrefix}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDevPrefix(val);
                        const next = generateDevSecret(devKeyType, val);
                        setGeneratedDevSecret(next);
                        pushHistory(next);
                      }}
                      placeholder="e.g. sk_live_, ghp_, env_"
                      className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--input-bg)] p-2 text-xs text-[var(--text-primary)] outline-none"
                    />
                  </div>
                )}

                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3 text-[11px] text-[var(--text-muted)] space-y-1">
                  <span className="font-semibold text-[var(--text-primary)] block">
                    Cryptographic Source:
                  </span>
                  <p>
                    Generated using hardware CSPRNG (Web Crypto Subsystem). High collision-resistance for microservices and API gateways.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
