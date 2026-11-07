"use client";

import { useEffect } from "react";
import { Eye, Lock, ShieldCheck } from "lucide-react";

interface PrivacyShieldScreenProps {
  isActive: boolean;
  onResume: () => void;
}

export function PrivacyShieldScreen({ isActive, onResume }: PrivacyShieldScreenProps) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = () => {
      onResume();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onResume]);

  if (!isActive) return null;

  return (
    <div
      onClick={onResume}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 select-none cursor-pointer animate-in fade-in duration-200"
    >
      <div className="max-w-md text-center space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-xl">
          <ShieldCheck className="size-8 text-blue-400" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center justify-center gap-2">
            <Lock className="size-4 text-emerald-400" />
            Display Masked for Privacy
          </h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Vaultwise has hidden your credentials to protect against background screenshot utilities and shoulder surfing while the window is inactive.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition active:scale-[0.98] cursor-pointer"
          >
            <Eye className="size-3.5" />
            Resume Active Session
          </button>
        </div>

        <p className="text-[10px] font-mono text-slate-500">
          Press any key or click anywhere to unmask
        </p>
      </div>
    </div>
  );
}
