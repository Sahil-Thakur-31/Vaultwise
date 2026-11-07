import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  tone: string;
  value: string;
  label: string;
  extra?: string;
}

export function MetricCard({ icon: Icon, tone, value, label, extra }: MetricCardProps) {
  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-highlight)] hover:shadow-lg hover:shadow-[var(--accent-glow)]/10 backdrop-blur-sm">
      <div className={`grid size-12 place-items-center rounded-xl shrink-0 transition-transform group-hover:scale-105 shadow-sm ${tone}`}>
        <Icon className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <b className="block text-2xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
          {value}
        </b>
        <small className="mt-0.5 block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </small>
      </div>
      {extra && (
        <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-bold text-emerald-500 border border-emerald-500/20">
          {extra}
        </span>
      )}
    </div>
  );
}
