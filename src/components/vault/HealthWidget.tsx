"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";

interface HealthWidgetProps {
  score: number;
  onReview: () => void;
}

export function HealthWidget({ score, onReview }: HealthWidgetProps) {
  const isHealthy = score >= 85;

  return (
    <aside className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 p-6 text-center shadow-sm backdrop-blur-sm flex flex-col justify-between transition-all duration-200 hover:border-[var(--border-highlight)]">
      <div>
        {/* Radial Conic Dial */}
        <div className="relative mx-auto size-28 my-1">
          <div
            className="grid size-full place-items-center rounded-full shadow-inner"
            style={{
              background: `radial-gradient(closest-side, var(--bg-card) 76%, transparent 78%), conic-gradient(var(--accent-primary) ${score}%, var(--border-subtle) 0)`,
            }}
          >
            <div className="text-center">
              <b className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] leading-none">
                {score}
              </b>
              <small className="block text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
                /100
              </small>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {isHealthy ? (
            <ShieldCheck className="size-4 text-emerald-400" />
          ) : (
            <ShieldAlert className="size-4 text-amber-400" />
          )}
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            Security Score
          </h2>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
          {isHealthy
            ? "Your vault has high cryptographic defense."
            : "Resolve weak & reused credentials to boost score."}
        </p>

        {/* Health items breakdown */}
        <div className="my-5 space-y-2.5 border-y border-[var(--border-subtle)] py-4 text-left text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Weak passwords</span>
            <span className="font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              2 flagged
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Reused passwords</span>
            <span className="font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
              1 duplicate
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">Two-step login</span>
            <span className="font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
              8 protected
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onReview}
        className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-surface-hover)] transition-all shadow-xs"
      >
        Run Security Audit →
      </button>
    </aside>
  );
}
