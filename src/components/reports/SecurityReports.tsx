"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { SecurityAuditResult, VaultItem } from "@/types/vault";
import { ItemLogo } from "../vault/ItemLogo";

interface SecurityReportsProps {
  audit: SecurityAuditResult;
  onFixItem: (item: VaultItem) => void;
}

export function SecurityReports({ audit, onFixItem }: SecurityReportsProps) {
  const isHealthy = audit.overallScore >= 80;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-app)] p-6 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Security Health Audit
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Real-time cryptographic audit calculated over your active vault items.
          </p>
        </div>

        {/* Dynamic Overall Score Banner */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-2xs">
          <div className="flex items-center gap-4">
            <div
              className={`grid size-12 place-items-center rounded-xl ${
                isHealthy
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}
            >
              {isHealthy ? <ShieldCheck className="size-6" /> : <ShieldAlert className="size-6" />}
            </div>
            <div>
              <b className="block text-base font-bold text-[var(--text-primary)]">
                Dynamic Health Score: {audit.overallScore} / 100
              </b>
              <small className="text-xs text-[var(--text-secondary)]">
                {audit.weakItems.length === 0 && audit.reusedItems.length === 0
                  ? "Outstanding defense. All items have unique, high-entropy credentials."
                  : `${audit.weakItems.length} weak items and ${audit.reusedItems.length} duplicate passwords detected.`}
              </small>
            </div>
          </div>

          <span
            className={`rounded px-2.5 py-1 text-xs font-semibold ${
              isHealthy
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isHealthy ? "Protected" : "Action Needed"}
          </span>
        </div>

        {/* Findings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
              <span>Weak Credentials</span>
              <span
                className={`rounded px-1.5 py-0.2 font-mono text-[11px] ${
                  audit.weakItems.length > 0
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                {audit.weakItems.length}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
              Passwords shorter than 12 characters or lacking varied character pools.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
              <span>Duplicate Passwords</span>
              <span
                className={`rounded px-1.5 py-0.2 font-mono text-[11px] ${
                  audit.reusedItems.length > 0
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-emerald-500/10 text-emerald-500"
                }`}
              >
                {audit.reusedItems.length}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
              Passwords reused across 2 or more accounts.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
              <span>2FA Authenticator</span>
              <span className="rounded bg-blue-500/10 text-blue-500 px-1.5 py-0.2 font-mono text-[11px]">
                {audit.totpProtectedCount} / {audit.totalLogins}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
              Logins with dynamic TOTP 2FA secret enabled.
            </p>
          </div>
        </div>

        {/* Real Dynamic Weak Items List */}
        {audit.weakItems.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-[var(--bg-card)] p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              Flagged Weak Items (Click to Update)
            </h3>
            <div className="divide-y divide-[var(--border-subtle)]">
              {audit.weakItems.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ItemLogo item={item} size="sm" />
                    <div className="min-w-0">
                      <b className="block text-[var(--text-primary)] truncate">{item.name}</b>
                      <small className="text-[11px] font-mono text-[var(--text-muted)]">
                        {item.username}
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFixItem(item)}
                    className="text-xs font-semibold text-[var(--accent-primary)] hover:underline shrink-0"
                  >
                    Inspect & Fix →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real Dynamic Reused Passwords List */}
        {audit.reusedItems.length > 0 && (
          <div className="mb-6 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-[var(--bg-card)] p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5" />
              Duplicate Password Clusters
            </h3>
            <div className="space-y-3">
              {audit.reusedItems.map((group, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3 text-xs"
                >
                  <div className="text-[11px] text-[var(--text-muted)] mb-2">
                    Password shared across <b className="text-[var(--text-primary)]">{group.count} services</b>:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onFixItem(item)}
                        className="flex items-center gap-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 text-xs hover:border-blue-500 transition"
                      >
                        <ItemLogo item={item} size="sm" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proactive Hardening Checklist */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-2xs">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">
            Security Best Practices
          </h3>
          <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Use the built-in generator to replace short passwords with 20+ character strings.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Store 2FA authenticator seeds directly inside logins for instant TOTP verification.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>Export encrypted JSON backups regularly and store them in secure offline storage.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
