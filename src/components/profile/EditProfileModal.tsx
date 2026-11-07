"use client";

import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { UserProfile, VaultScope } from "@/types/vault";
import { Check, Mail, Shield, User } from "lucide-react";

interface EditProfileModalProps {
  profile: UserProfile;
  scope: VaultScope;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

const AVATAR_COLORS = [
  { id: "slate", bg: "bg-slate-800", text: "text-slate-200", border: "border-slate-700" },
  { id: "blue", bg: "bg-blue-600", text: "text-white", border: "border-blue-500" },
  { id: "emerald", bg: "bg-emerald-600", text: "text-white", border: "border-emerald-500" },
  { id: "violet", bg: "bg-violet-600", text: "text-white", border: "border-violet-500" },
  { id: "amber", bg: "bg-amber-600", text: "text-white", border: "border-amber-500" },
  { id: "rose", bg: "bg-rose-600", text: "text-white", border: "border-rose-500" },
];

export function EditProfileModal({
  profile,
  scope,
  onSave,
  onClose,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name || "Sahil Thakur");
  const [email, setEmail] = useState(profile.email || "sahilthakur3109@gmail.com");
  const [selectedColor, setSelectedColor] = useState(profile.avatarColor || "slate");

  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SK";

  const currentColorConfig =
    AVATAR_COLORS.find((c) => c.id === selectedColor) || AVATAR_COLORS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...profile,
      name: name.trim(),
      email: email.trim(),
      avatarColor: selectedColor,
    });
    onClose();
  };

  return (
    <Modal title="Edit Profile Details" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Avatar Preview & Color Palette */}
        <div className="flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3.5">
          <div
            className={`grid size-12 place-items-center rounded-xl font-bold text-sm shadow-md border ${currentColorConfig.bg} ${currentColorConfig.text} ${currentColorConfig.border} shrink-0`}
          >
            {initials}
          </div>

          <div className="flex-1 space-y-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
              Avatar Theme & Initials
            </span>
            <div className="flex items-center gap-1.5">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`size-5 rounded-full border ${c.bg} ${
                    selectedColor === c.id
                      ? "ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-card)] scale-110"
                      : "opacity-80 hover:opacity-100"
                  } transition cursor-pointer`}
                  title={c.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
            Full Name
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] transition">
            <User className="size-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sahil Thakur"
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Email Address Field */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
            Email Address
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] transition">
            <Mail className="size-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@vaultwise.dev"
              className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Current Vault Scope Badge */}
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5 font-medium">
            <Shield className="size-3 text-emerald-500" />
            Current Enclave Scope:
          </span>
          <span className="rounded bg-[var(--bg-card)] px-2 py-0.5 font-semibold text-[var(--text-primary)] border border-[var(--border-subtle)]">
            {scope === "personal" ? "Personal Vault" : "Organization Workspace"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition cursor-pointer shadow-sm"
          >
            <Check className="size-3.5" />
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
