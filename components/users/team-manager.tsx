"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, ShieldAlert, Trash2, RefreshCw, CheckCircle2, AlertCircle, Shield } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  createdAt: string;
}

interface TeamManagerProps {
  userRole: string;
  currentUserId?: string; // To prevent self-deletion or self-promotion
}

export default function TeamManager({ userRole, currentUserId }: TeamManagerProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form Invite States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("VIEWER");
  const [inviting, setInviting] = useState(false);

  // Indicators
  const [successText, setSuccessText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  const isAdmin = userRole === "ADMIN";

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!name.trim() || !email.trim()) return;

    setInviting(true);
    setSuccessText(null);
    setErrorText(null);

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), role: inviteRole }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessText(`Successfully invited ${name} as ${inviteRole}.`);
        setName("");
        setEmail("");
        setMembers((prev) => [...prev, json.data]);
      } else {
        setErrorText(json.message || "Failed to invite teammate.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Connection error while inviting teammate.");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (targetId: string, newRole: string) => {
    if (!isAdmin) return;
    setSuccessText(null);
    setErrorText(null);

    try {
      const res = await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId, role: newRole }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessText(json.message || "Role updated.");
        setMembers((prev) =>
          prev.map((m) => (m.id === targetId ? { ...m, role: newRole as any } : m))
        );
      } else {
        setErrorText(json.message || "Failed to update role.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Failed to change role.");
    }
  };

  const handleRemoveMember = async (targetId: string) => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to remove this teammate from the workspace?")) return;

    setSuccessText(null);
    setErrorText(null);

    try {
      const res = await fetch(`/api/team?targetUserId=${targetId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessText("Teammate removed from workspace.");
        setMembers((prev) => prev.filter((m) => m.id !== targetId));
      } else {
        setErrorText(json.message || "Failed to remove member.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Failed to remove member.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-base font-bold text-slate-800">Team & Access Management</h4>
        <p className="text-xs text-slate-500">Configure teammate roles and workspace accessibility permissions.</p>
      </div>

      {/* Banner status */}
      {successText && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span className="font-bold">{successText}</span>
        </div>
      )}

      {errorText && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-650 shrink-0" />
          <span className="font-bold">{errorText}</span>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-bold">Access Limited: Workspace settings are Admin-only. Teammate changes are disabled.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Invite Teammate Card (Only active for Admin) */}
        <div className="md:col-span-1 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm h-fit space-y-4">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <UserPlus className="h-4 w-4 text-slate-400" /> Invite Team Member
          </h5>

          <form onSubmit={handleInviteSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">Teammate Full Name</label>
              <input
                type="text"
                required
                disabled={!isAdmin || inviting}
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary/30 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">Email Address (Gmail)</label>
              <input
                type="email"
                required
                disabled={!isAdmin || inviting}
                placeholder="sarah.jenkins@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-primary/30 disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">Assign Access Role</label>
              <select
                disabled={!isAdmin || inviting}
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl p-2.5 outline-none disabled:opacity-60"
              >
                <option value="VIEWER">VIEWER (Read-only)</option>
                <option value="ANALYST">ANALYST (Create/Upload/AI)</option>
                <option value="ADMIN">ADMIN (Full Workspace Owner)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!isAdmin || inviting || !name.trim() || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md disabled:opacity-50 transition"
            >
              {inviting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserPlus className="h-3.5 w-3.5" />
              )}
              Send Workspace Invite
            </button>
          </form>
        </div>

        {/* 2. Workspace Member List (2 cols) */}
        <div className="md:col-span-2 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Shield className="h-4 w-4 text-brand-primary animate-pulse" /> Workspace Member List
          </h5>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-brand-primary" />
              <span>Fetching team directory...</span>
            </div>
          ) : members.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Role selector (disabled for non-admins or self) */}
                    <select
                      value={member.role}
                      disabled={!isAdmin || member.id === currentUserId}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-700 rounded-lg p-1 outline-none disabled:opacity-70"
                    >
                      <option value="VIEWER">VIEWER</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>

                    {/* Delete button (disabled for non-admins or self) */}
                    <button
                      disabled={!isAdmin || member.id === currentUserId}
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                      title="Remove Teammate"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-[10px] text-slate-400 font-bold">
              Workspace holds no members.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
