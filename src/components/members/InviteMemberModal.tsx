"use client";

import { FormEvent } from "react";
import { Modal } from "@/components/common/Modal";
import { Actions, Field } from "@/components/common/FormControls";
import { MemberRole } from "@/types/vault";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: MemberRole) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
}: InviteMemberModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const role = String(formData.get("role")) as MemberRole;

    if (!email) return;

    onInvite(email, role);
    onClose();
  };

  return (
    <Modal title="Invite a member" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">
          They’ll receive an invitation email to join Northstar Studio.
        </p>

        <Field label="Email address">
          <input
            required
            name="email"
            type="email"
            placeholder="colleague@northstar.io"
            autoFocus
          />
        </Field>

        <Field label="Role in organization">
          <select name="role" defaultValue="Member">
            <option value="Member">Member (standard vault access)</option>
            <option value="Admin">Admin (can invite & manage)</option>
          </select>
        </Field>

        <Actions close={onClose} label="Send invitation" />
      </form>
    </Modal>
  );
}
