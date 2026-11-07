"use client";

import { ExternalLink, Sparkles } from "lucide-react";
import { VaultItem } from "@/types/vault";
import { ItemLogo } from "./ItemLogo";

interface QuickAccessProps {
  items: VaultItem[];
  onOpenItem: (item: VaultItem) => void;
}

export function QuickAccess({ items, onOpenItem }: QuickAccessProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-400" />
            Quick Launch
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Pinned credentials for instant browser launch
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {items.slice(0, 4).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpenItem(item)}
            className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[var(--border-highlight)] hover:shadow-xl hover:shadow-[var(--accent-glow)]/15 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <ItemLogo item={item} />
              <ExternalLink className="size-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors opacity-0 group-hover:opacity-100" />
            </div>

            <div className="mt-4">
              <b className="block truncate text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                {item.name}
              </b>
              <small className="mt-0.5 block truncate text-[11px] font-mono text-[var(--text-secondary)]">
                {item.username}
              </small>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
