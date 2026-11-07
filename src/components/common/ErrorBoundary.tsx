"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, RotateCcw, ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Vaultwise Uncaught Error Boundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleFullReload = () => {
    window.location.reload();
  };

  private handleSafeStorageReset = () => {
    if (confirm("Reset local storage cache to starter defaults? This resolves corrupted state while keeping your vault secure.")) {
      try {
        localStorage.clear();
      } catch {
        // ignore
      }
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-app)] p-6 select-none">
          <div className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-[var(--bg-card)] p-8 shadow-2xl animate-scale-in text-center space-y-5">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="size-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Application State Interrupted
              </h2>
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                An unexpected technical exception occurred while rendering the vault interface. Your encrypted credentials remain secure in local memory.
              </p>
            </div>

            {this.state.error && (
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--code-bg)] p-3 text-left font-mono text-[11px] text-rose-400 overflow-x-auto max-h-32">
                <span className="font-bold flex items-center gap-1 mb-1 text-rose-500">
                  <AlertTriangle className="size-3" /> {this.state.error.name}:
                </span>
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                Recover View
              </button>

              <button
                type="button"
                onClick={this.handleFullReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Reload Application
              </button>
            </div>

            <button
              type="button"
              onClick={this.handleSafeStorageReset}
              className="text-[10px] text-[var(--text-muted)] hover:text-rose-400 underline transition cursor-pointer"
            >
              Emergency Safe Storage Reset
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
