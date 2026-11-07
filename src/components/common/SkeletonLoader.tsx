"use client";

import { useId } from "react";

export function SkeletonBox({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-shimmer rounded-md bg-[var(--bg-app)] ${className}`}
      style={style}
    />
  );
}

// 1. Vault Items List Skeleton
export function VaultListSkeleton({ count = 7 }: { count?: number }) {
  const baseId = useId();
  return (
    <div className="flex-1 overflow-hidden divide-y divide-[var(--border-subtle)]">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`${baseId}-item-${i}`}
          className="flex items-center justify-between gap-3 px-4 py-3.5"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <SkeletonBox className="size-8 rounded-lg shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <SkeletonBox className="h-3.5 w-28 rounded" />
                <SkeletonBox className="h-3 w-8 rounded" />
              </div>
              <SkeletonBox className="h-2.5 w-40 rounded opacity-70" />
            </div>
          </div>
          <SkeletonBox className="size-4 rounded-full shrink-0 opacity-40" />
        </div>
      ))}
    </div>
  );
}

// 2. Vault Item Detail Skeleton
export function VaultDetailSkeleton() {
  const baseId = useId();
  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-app)] p-6 sm:p-8 select-none animate-fade-in">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-4 flex-1">
            <SkeletonBox className="size-14 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-5 w-48 rounded" />
                <SkeletonBox className="h-4 w-14 rounded-full" />
              </div>
              <SkeletonBox className="h-3 w-32 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-8 w-16 rounded-md" />
            <SkeletonBox className="size-8 rounded-md" />
            <SkeletonBox className="size-8 rounded-md" />
          </div>
        </div>

        {/* Credentials Cards */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`${baseId}-card-${i}`}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <SkeletonBox className="h-3 w-20 rounded" />
                <SkeletonBox className="h-3 w-10 rounded" />
              </div>
              <SkeletonBox className="h-5 w-3/4 rounded" />
            </div>
          ))}

          {/* Large Note card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs space-y-2">
            <SkeletonBox className="h-3 w-16 rounded" />
            <SkeletonBox className="h-16 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Reports & Security Audit Skeleton
export function ReportsSkeleton() {
  const baseId = useId();
  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 animate-fade-in">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
          <div className="flex items-center gap-5">
            <SkeletonBox className="size-20 rounded-full shrink-0" />
            <div className="space-y-2">
              <SkeletonBox className="h-5 w-44 rounded" />
              <SkeletonBox className="h-3 w-64 rounded" />
            </div>
          </div>
          <div className="flex gap-3">
            <SkeletonBox className="h-9 w-28 rounded-lg" />
            <SkeletonBox className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* 4 Health Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`${baseId}-metric-${i}`}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <SkeletonBox className="h-3 w-24 rounded" />
                <SkeletonBox className="size-6 rounded-md" />
              </div>
              <SkeletonBox className="h-7 w-16 rounded" />
              <SkeletonBox className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Report Table Placeholder */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 space-y-3">
          <SkeletonBox className="h-4 w-36 rounded" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`${baseId}-row-${i}`}
                className="flex items-center justify-between p-2 rounded bg-[var(--bg-app)]"
              >
                <div className="flex items-center gap-3">
                  <SkeletonBox className="size-6 rounded" />
                  <SkeletonBox className="h-3 w-32 rounded" />
                </div>
                <SkeletonBox className="h-5 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Send View Skeleton
export function SendSkeleton() {
  const baseId = useId();
  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 animate-fade-in">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="space-y-1.5">
            <SkeletonBox className="h-5 w-40 rounded" />
            <SkeletonBox className="h-3 w-60 rounded" />
          </div>
          <SkeletonBox className="h-9 w-28 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`${baseId}-send-${i}`}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <SkeletonBox className="h-4 w-32 rounded" />
                <SkeletonBox className="h-4 w-12 rounded-full" />
              </div>
              <SkeletonBox className="h-3 w-48 rounded" />
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                <SkeletonBox className="h-3 w-20 rounded" />
                <SkeletonBox className="h-6 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Generic View Skeleton (Tools / Settings / Members)
export function GenericViewSkeleton({ title = "Loading Workspace..." }: { title?: string }) {
  const baseId = useId();
  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8 animate-fade-in">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-1.5 pb-4 border-b border-[var(--border-subtle)]">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] animate-pulse block">
            {title}
          </span>
          <SkeletonBox className="h-6 w-48 rounded" />
          <SkeletonBox className="h-3 w-80 rounded" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`${baseId}-card-${i}`}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-3"
            >
              <SkeletonBox className="h-4 w-36 rounded" />
              <SkeletonBox className="h-3 w-full rounded" />
              <div className="flex gap-2 pt-2">
                <SkeletonBox className="h-8 w-24 rounded-md" />
                <SkeletonBox className="h-8 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
