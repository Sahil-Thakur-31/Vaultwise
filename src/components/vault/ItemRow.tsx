"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff, Star, Trash2, ExternalLink } from "lucide-react";
import { VaultItem } from "@/types/vault";
import { ItemLogo } from "./ItemLogo";
import { copySensitiveText, copyTextSafely } from "@/lib/clipboard";

interface ItemRowProps {
  item: VaultItem;
  onToggleFavorite?: (id: number) => void;
  onDelete?: (id: number) => void;
  onNotify: (message: string) => void;
}

export function ItemRow({
  item,
  onToggleFavorite,
  onDelete,
  onNotify,
}: ItemRowProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      const lower = label.toLowerCase();
      const isSensitive = lower.includes("password") || lower.includes("card") || lower.includes("pin");
      const ok = isSensitive
        ? await copySensitiveText(text, `${item.name} ${label}`, undefined, onNotify)
        : await copyTextSafely(text);

      if (ok) {
        setCopiedField(label);
        if (!isSensitive) {
          onNotify(`${item.name}: ${label} copied to clipboard`);
        }
        setTimeout(() => setCopiedField(null), 1800);
      } else {
        onNotify("Failed to copy to clipboard");
      }
    } catch {
      onNotify("Failed to copy to clipboard");
    }
  };

  const hasPassword = Boolean(item.password);

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50 p-4 transition-all duration-200 hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-highlight)] first:rounded-t-2xl last:rounded-b-2xl last:border-b-0">
      {/* Left: Logo, Name & Type */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <ItemLogo item={item} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <b className="truncate text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
              {item.name}
            </b>
            <span className="rounded-md border border-[var(--border-subtle)] bg-[var(--badge-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--badge-text)]">
              {item.type}
            </span>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                title={`Open ${item.url}`}
              >
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span className="truncate text-xs font-mono text-[var(--text-secondary)] select-all">
              {item.username}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(item.username, "Username")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition opacity-0 group-hover:opacity-100"
              title="Copy username"
            >
              {copiedField === "Username" ? (
                <Check className="size-3 text-emerald-400" />
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Middle: Secret / Password preview */}
      {hasPassword && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--code-bg)] px-3 py-1.5 text-xs text-[var(--text-secondary)] sm:min-w-[170px] justify-between">
          <span className="font-mono tracking-wider truncate max-w-[110px] select-all">
            {showPassword ? item.password : "••••••••••••"}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              title={showPassword ? "Hide password" : "Reveal password"}
            >
              {showPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(item.password!, "Password")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
              title="Copy password"
            >
              {copiedField === "Password" ? (
                <Check className="size-3.5 text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Right: Timestamp & Action buttons */}
      <div className="flex items-center gap-3 justify-end shrink-0">
        <small className="hidden md:inline-block text-[11px] font-medium text-[var(--text-muted)]">
          {item.updated}
        </small>

        {/* Favorite button */}
        <button
          type="button"
          onClick={() => onToggleFavorite?.(item.id)}
          className={`grid size-8 place-items-center rounded-lg transition-colors ${
            item.favorite
              ? "text-amber-400 hover:bg-amber-400/10"
              : "text-[var(--text-muted)] hover:bg-[var(--border-subtle)] hover:text-amber-400"
          }`}
          title={item.favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={`size-4 ${item.favorite ? "fill-amber-400" : ""}`}
          />
        </button>

        {/* Delete button */}
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              if (confirm(`Remove "${item.name}" from this vault?`)) {
                onDelete(item.id);
                onNotify(`${item.name} removed from vault`);
              }
            }}
            className="grid size-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            title="Delete item"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
