"use client";

import { Star } from "lucide-react";
import { VaultItem } from "@/types/vault";
import { ItemRow } from "../vault/ItemRow";

interface FavoritesViewProps {
  label: string;
  items: VaultItem[];
  onToggleFavorite: (id: number) => void;
  onDeleteItem: (id: number) => void;
  onNotify: (msg: string) => void;
}

export function FavoritesView({
  label,
  items,
  onToggleFavorite,
  onDeleteItem,
  onNotify,
}: FavoritesViewProps) {
  return (
    <section>
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--badge-bg)] px-2.5 py-1 text-[10px] font-bold tracking-[.14em] text-[var(--badge-text)] uppercase mb-2 border border-[var(--border-subtle)]">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          {label}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Pinned Favorites
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Quick-access credentials marked with a star for priority use.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 shadow-sm backdrop-blur-sm">
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
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/40 p-16 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 mx-auto mb-4">
            <Star className="size-7 fill-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            No favorites pinned yet
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            Click the star icon next to any credential in your vault to bookmark it here for fast access.
          </p>
        </div>
      )}
    </section>
  );
}
