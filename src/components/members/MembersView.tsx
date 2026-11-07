"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  Download,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Member, MemberRole } from "@/types/vault";

interface MembersViewProps {
  members: Member[];
  onInvite: () => void;
  onUpdateRole: (id: number, newRole: MemberRole) => void;
  onRemoveMember: (id: number) => void;
  onManagePlan?: () => void;
}

interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target?: string;
  timestamp: string;
  status: "success" | "warning" | "info";
  ip: string;
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    actor: "Sarah Chen (Owner)",
    action: "Updated policy: Enforced 2FA for all workspace accounts",
    target: "Organization Policy",
    timestamp: "Just now",
    status: "success",
    ip: "192.168.1.104",
  },
  {
    id: "log-2",
    actor: "David Kim (Admin)",
    action: "Invited new team member: elena.rostova@northstar.io",
    target: "Member Provisioning",
    timestamp: "2 hours ago",
    status: "info",
    ip: "10.0.4.12",
  },
  {
    id: "log-3",
    actor: "Marcus Vance (Member)",
    action: "Decrypted shared production credential: 'AWS Root IAM'",
    target: "Production Secrets",
    timestamp: "Yesterday at 16:42",
    status: "warning",
    ip: "172.16.0.88",
  },
  {
    id: "log-4",
    actor: "Sarah Chen (Owner)",
    action: "Rotated master workspace recovery cryptographic key",
    target: "Emergency Enclave",
    timestamp: "3 days ago",
    status: "success",
    ip: "192.168.1.104",
  },
  {
    id: "log-5",
    actor: "System Sentinel",
    action: "Automated breach scan verified 0 compromised credentials",
    target: "Security Audit",
    timestamp: "5 days ago",
    status: "success",
    ip: "Internal Enclave",
  },
];

export function MembersView({
  members,
  onInvite,
  onUpdateRole,
  onRemoveMember,
  onManagePlan,
}: MembersViewProps) {
  const [activeTab, setActiveTab] = useState<"roster" | "matrix" | "audit">("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | MemberRole>("all");

  const maxSeats = 10;
  const availableSeats = Math.max(0, maxSeats - members.length);
  const seatPercentage = Math.round((members.length / maxSeats) * 100);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

  const handleExportAuditLogs = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Timestamp,Actor,Action,Target,Status,IP"]
        .concat(
          MOCK_AUDIT_LOGS.map(
            (l) =>
              `"${l.timestamp}","${l.actor}","${l.action.replace(/"/g, '""')}","${l.target || ""}","${l.status}","${l.ip}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vaultwise-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-app)] p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Organization & Members
              </h1>
              <span className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent-text)]">
                Northstar Studio
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Enterprise Zero-Knowledge team access control, seat provisioning, and cryptographic audit trails.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onInvite}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[var(--accent-hover)] transition"
            >
              <UserPlus className="size-3.5" />
              Invite Member
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Seats Card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Team Seats
              </span>
              <Users className="size-4 text-[var(--accent-text)]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {members.length}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                / {maxSeats} seats
              </span>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-300"
                  style={{ width: `${seatPercentage}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)]">
                  {availableSeats} available
                </span>
                <button
                  type="button"
                  onClick={onManagePlan}
                  className="font-medium text-[var(--accent-text)] hover:underline"
                >
                  Manage Seats
                </button>
              </div>
            </div>
          </div>

          {/* Security & 2FA Enforcement */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                2FA Compliance
              </span>
              <ShieldCheck className="size-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-500">100%</span>
              <span className="text-xs text-[var(--text-muted)]">Enforced</span>
            </div>
            <p className="mt-3 text-[11px] text-[var(--text-muted)] leading-relaxed">
              FIDO2 / Hardware WebAuthn & Authenticator TOTP mandated for all members.
            </p>
          </div>

          {/* Access Policy Card */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                Access Shield
              </span>
              <Lock className="size-4 text-violet-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--text-primary)]">Zero-Knowledge</span>
            </div>
            <p className="mt-3 text-[11px] text-[var(--text-muted)] leading-relaxed">
              End-to-end encrypted sharing via elliptic curve public-key cryptography.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[var(--border-subtle)] pb-px">
          <button
            type="button"
            onClick={() => setActiveTab("roster")}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "roster"
                ? "border-[var(--accent-primary)] text-[var(--accent-text)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Users className="size-3.5" />
            Members Roster ({filteredMembers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "matrix"
                ? "border-[var(--accent-primary)] text-[var(--accent-text)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Shield className="size-3.5" />
            Role Permissions Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "audit"
                ? "border-[var(--accent-primary)] text-[var(--accent-text)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Activity className="size-3.5" />
            Audit Activity Trail
          </button>
        </div>

        {/* TAB 1: MEMBERS ROSTER */}
        {activeTab === "roster" && (
          <div className="space-y-3">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members by name or email..."
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] py-1.5 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              {/* Role filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(["all", "Owner", "Admin", "Member"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition capitalize ${
                      roleFilter === r
                        ? "bg-[var(--accent-primary)] text-white shadow-2xs"
                        : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {r === "all" ? "All Roles" : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xs">
              <div className="grid grid-cols-[1.6fr_120px_100px_90px_40px] gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <span>Member</span>
                <span>Role</span>
                <span>2FA Status</span>
                <span>Status</span>
                <span className="text-right">Action</span>
              </div>

              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  No members found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-[1.6fr_120px_100px_90px_40px] items-center gap-4 px-4 py-2.5 text-xs hover:bg-[var(--bg-surface-hover)] transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid size-8 place-items-center rounded-full bg-[var(--accent-subtle)] text-xs font-bold text-[var(--accent-text)] shrink-0 border border-[var(--border-subtle)]">
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <b className="block truncate font-semibold text-[var(--text-primary)]">
                            {member.name}
                          </b>
                          <small className="block truncate text-[11px] font-mono text-[var(--text-muted)]">
                            {member.email}
                          </small>
                        </div>
                      </div>

                      {/* Role Dropdown */}
                      <div>
                        <select
                          value={member.role}
                          onChange={(e) => onUpdateRole(member.id, e.target.value as MemberRole)}
                          className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-app)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)] outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                        >
                          <option value="Owner">Owner</option>
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                        </select>
                      </div>

                      {/* 2FA Badge */}
                      <div>
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="size-3" />
                          Enforced
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            member.status === "Active"
                              ? "text-emerald-500"
                              : "text-amber-500"
                          }`}
                        >
                          {member.status === "Active" && <Check className="size-3" />}
                          {member.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="text-right">
                        {member.role !== "Owner" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${member.name} from Northstar Studio?`)) {
                                onRemoveMember(member.id);
                              }
                            }}
                            className="p-1 text-[var(--text-muted)] hover:text-rose-500 transition rounded hover:bg-rose-500/10"
                            title="Remove member"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ROLE PERMISSIONS MATRIX */}
        {activeTab === "matrix" && (
          <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xs">
            <div className="border-b border-[var(--border-subtle)] p-4 bg-[var(--bg-app)]">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Workspace Role Capabilities
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Comparison of cryptographic and administrative authorizations per workspace role.
              </p>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-2.5 bg-[var(--bg-card)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <span>Permission Capability</span>
                <span className="text-center font-bold text-[var(--accent-text)]">Owner</span>
                <span className="text-center font-bold text-[var(--text-primary)]">Admin</span>
                <span className="text-center font-bold text-[var(--text-secondary)]">Member</span>
              </div>

              {[
                { name: "View and create shared items in authorized collections", owner: true, admin: true, member: true },
                { name: "Create & organize custom collections/folders", owner: true, admin: true, member: true },
                { name: "Invite new team members into the workspace", owner: true, admin: true, member: false },
                { name: "Modify roles or remove members", owner: true, admin: true, member: false },
                { name: "Manage enterprise billing, plan tier, and seats", owner: true, admin: false, member: false },
                { name: "Export unencrypted workspace cryptographic archive", owner: true, admin: false, member: false },
                { name: "Configure enterprise master password policies & SSO", owner: true, admin: true, member: false },
                { name: "Access immutable organization audit activity log", owner: true, admin: true, member: false },
                { name: "Emergency recovery kit rotation & master override", owner: true, admin: false, member: false },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3 text-xs hover:bg-[var(--bg-surface-hover)] transition"
                >
                  <span className="text-[var(--text-primary)] font-medium">
                    {row.name}
                  </span>
                  <div className="flex justify-center">
                    {row.owner ? (
                      <span className="grid size-5 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <Check className="size-3" />
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {row.admin ? (
                      <span className="grid size-5 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <Check className="size-3" />
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {row.member ? (
                      <span className="grid size-5 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <Check className="size-3" />
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT ACTIVITY LOG */}
        {activeTab === "audit" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  Cryptographic Audit Trail
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Tamper-evident log of member actions, credential decryptions, and policy changes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportAuditLogs}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition shadow-2xs cursor-pointer"
              >
                <Download className="size-3.5" />
                Export CSV
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xs divide-y divide-[var(--border-subtle)]">
              {MOCK_AUDIT_LOGS.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 hover:bg-[var(--bg-surface-hover)] transition text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 grid size-7 place-items-center rounded-lg ${
                        log.status === "success"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : log.status === "warning"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      <Activity className="size-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <b className="font-semibold text-[var(--text-primary)]">
                          {log.actor}
                        </b>
                        {log.target && (
                          <span className="rounded bg-[var(--bg-app)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            {log.target}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        {log.action}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center text-[11px] text-[var(--text-muted)]">
                    <span className="font-medium">{log.timestamp}</span>
                    <span className="font-mono text-[10px]">{log.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
