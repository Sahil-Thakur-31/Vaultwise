"use client";

import { CheckCircle2, KeyRound, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { FilterCategory, VaultItem } from "@/types/vault";
import { MetricCard } from "./MetricCard";
import { HealthWidget } from "./HealthWidget";
import { ItemRow } from "./ItemRow";
import { QuickAccess } from "./QuickAccess";

interface VaultDashboardProps {
  label: string;
  items: VaultItem[];
  displayed: VaultItem[];
  health: number;
  query: string;
  category: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  onAdd: () => void;
  onViewAll: () => void;
  onOpenReports: () => void;
  onToggleFavorite: (id: number) => void;
  onDeleteItem: (id: number) => void;
  onNotify: (message: string) => void;
}

export function VaultDashboard({
  label,
  items,
  displayed,
  health,
  query,
  category,
  onSelectCategory,
  onAdd,
  onViewAll,
  onOpenReports,
  onToggleFavorite,
  onDeleteItem,
  onNotify,
}: VaultDashboardProps) {
  const isPersonal = label === "PERSONAL VAULT";

  const categories: Array<{ id: FilterCategory; label: string }> = [
    { id: "all", label: "All Items" },
    { id: "Login", label: "Logins" },
    { id: "Card", label: "Cards" },
    { id: "Secure note", label: "Secure Notes" },
    { id: "favorites", label: "Favorites" },
  ];

  return (
    <>
      {/* Header bar */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--badge-bg)] px-2.5 py-1 text-[10px] font-bold tracking-[.14em] text-[var(--badge-text)] uppercase mb-2 border border-[var(--border-subtle)]">
            <Sparkles className="size-3" />
            {label}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {isPersonal ? "Good morning, Sahil." : "Northstar Studio vault"}
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Client-side encrypted credentials with zero-knowledge architecture.
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

      {/* Metrics Row */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={KeyRound}
          tone="bg-violet-500/10 text-violet-400 border border-violet-500/20"
          value={String(items.length)}
          label="Vault items"
        />
        <MetricCard
          icon={ShieldCheck}
          tone="bg-amber-500/10 text-amber-400 border border-amber-500/20"
          value={`${health}%`}
          label="Defense score"
          extra="+6% audit"
        />
        <MetricCard
          icon={CheckCircle2}
          tone="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          value="Encrypted"
          label="AES-256 session"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? "bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-glow)]"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-highlight)] hover:text-[var(--text-primary)]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Layout: Items List + Health Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_320px] gap-6">
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 shadow-sm backdrop-blur-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  {category === "all" ? "Recent credentials" : `${category} items`}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Your encrypted secrets and access keys
                </p>
              </div>
              <button
                type="button"
                onClick={onViewAll}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline transition"
              >
                View all ({displayed.length}) →
              </button>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {displayed.slice(0, 5).map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggleFavorite={onToggleFavorite}
                  onDelete={onDeleteItem}
                  onNotify={onNotify}
                />
              ))}
            </div>

            {displayed.length === 0 && (
              <div className="py-16 text-center text-sm text-[var(--text-muted)]">
                {query
                  ? `No vault items match “${query}”.`
                  : `No items in ${category} category.`}
              </div>
            )}
          </div>
        </section>

        <HealthWidget score={health} onReview={onOpenReports} />
      </div>

      {/* Quick Launch Cards */}
      <QuickAccess
        items={items}
        onOpenItem={(item) => onNotify(`${item.name} opened securely`)}
      />
    </>
  );
}
