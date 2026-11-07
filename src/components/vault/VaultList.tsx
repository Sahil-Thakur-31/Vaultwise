"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { VaultItem } from "@/types/vault";
import { ItemRow } from "./ItemRow";

interface VaultListProps {
  label: string;
  items: VaultItem[];
  onAdd: () => void;
  onBack?: () => void;
  onToggleFavorite: (id: number) => void;
  onDeleteItem: (id: number) => void;
  onNotify: (msg: string) => void;
}

export function VaultList({
  label,
  items,
  onAdd,
  onBack,
  onToggleFavorite,
  onDeleteItem,
  onNotify,
}: VaultListProps) {
  const isPersonal = label === "PERSONAL VAULT";

  return (
    <section>
      <div className="mb-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Back to dashboard
            </button>
          )}
          <p className="mb-2 text-[10px] font-bold tracking-[.14em] text-[var(--accent-primary)] uppercase">
            {label}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {isPersonal ? "All Vault Items" : "Organization Workspace Items"}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Total {items.length} items protected with client-side encryption.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:brightness-110 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          New item
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 shadow-sm backdrop-blur-sm">
        <div className="grid grid-cols-[minmax(0,1.3fr)_1fr_130px] gap-4 bg-[var(--bg-surface)] px-6 py-3.5 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase border-b border-[var(--border-subtle)]">
          <span>ITEM & TITLE</span>
          <span className="hidden sm:inline">CREDENTIAL DETAILS</span>
          <span className="text-right">ACTIONS</span>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDeleteItem}
              onNotify={onNotify}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="py-20 text-center text-sm text-[var(--text-muted)]">
            No items found matching your criteria.
          </div>
        )}
      </div>
    </section>
  );
}
