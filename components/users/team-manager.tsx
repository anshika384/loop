"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, ShieldAlert, Trash2, RefreshCw, CheckCircle2, AlertCircle, Shield, MoreVertical, Clipboard, ExternalLink, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SuccessDialog from "@/components/shared/success-dialog";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  createdAt: string;
  status: "Active" | "Invited" | "Pending";
  lastActive: string | null;
  isInvitation: boolean;
  token?: string;
  expiresAt?: string;
}

interface TeamManagerProps {
  userRole: string;
  currentUserId?: string;
  workspaceName?: string;
}

export default function TeamManager({ userRole, currentUserId, workspaceName }: TeamManagerProps) {
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

  // Success Dialog & Toast States
  const [inviteModalData, setInviteModalData] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    inviteUrl: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  const [viewModalData, setViewModalData] = useState<{
    isOpen: boolean;
    member: Member;
  } | null>(null);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = userRole === "ADMIN";

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerToast("Invitation link copied successfully.");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to copy link.");
    }
  };

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
        setName("");
        setEmail("");
        // Reload all members
        await fetchMembers();

        if (!json.emailSent && json.inviteUrl) {
          // Open the manual invitation modal
          setInviteModalData({
            isOpen: true,
            title: "Workspace Invitation Created",
            description: json.emailError
              ? `Workspace invitation created, but email delivery failed:\n${json.emailError}\n\nFalling back to development mode. Share the secure invitation link below manually.`
              : "Development Mode is enabled.\nEmail delivery is disabled.\nShare the secure invitation link below manually.",
            inviteUrl: json.inviteUrl,
            name: json.data.name,
            email: json.data.email,
            role: json.data.role,
          });
        } else {
          setSuccessText("Workspace invitation email sent successfully.");
        }
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

    const member = members.find((m) => m.id === targetId);
    if (!member) return;

    try {
      const res = await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId, role: newRole, isInvitation: member.isInvitation }),
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

  const handleRegenerateLink = async (targetId: string) => {
    setSuccessText(null);
    setErrorText(null);
    setActiveMenuId(null);
    setLoading(true);

    try {
      const res = await fetch("/api/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId, action: "regenerate" }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessText("Invitation link regenerated successfully.");
        setMembers((prev) =>
          prev.map((m) =>
            m.id === targetId
              ? {
                  ...m,
                  token: json.data.token,
                  expiresAt: json.data.expiresAt,
                  createdAt: json.data.createdAt,
                  status: "Invited",
                }
              : m
          )
        );

        const updated = members.find((m) => m.id === targetId);
        if (updated) {
          setInviteModalData({
            isOpen: true,
            title: "Invitation Link Regenerated",
            description: "The secure invitation link has been updated successfully.",
            inviteUrl: json.inviteUrl,
            name: updated.name,
            email: updated.email,
            role: updated.role,
          });
        }
      } else {
        setErrorText(json.message || "Failed to regenerate invitation link.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Failed to regenerate invitation link.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (targetId: string) => {
    if (!isAdmin) return;
    const member = members.find((m) => m.id === targetId);
    if (!member) return;

    const actionText = member.isInvitation ? "cancel the invitation for" : "remove";
    if (!confirm(`Are you sure you want to ${actionText} ${member.name} from the workspace?`)) return;

    setSuccessText(null);
    setErrorText(null);
    setActiveMenuId(null);

    try {
      const res = await fetch(`/api/team?targetUserId=${targetId}&isInvitation=${member.isInvitation}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (res.ok && json.success) {
        triggerToast("Teammate removed successfully.");
        setMembers((prev) => prev.filter((m) => m.id !== targetId));
        await fetchMembers();
      } else {
        setErrorText(json.message || "Failed to remove member.");
      }
    } catch (err) {
      console.error(err);
      setErrorText("Failed to remove member.");
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getStatusStyle = (status: "Active" | "Invited" | "Pending") => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-50 border-green-200";
      case "Invited":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-slate-500 bg-slate-50 border-slate-200";
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
          <AlertCircle className="h-4 w-4 text-red-655 text-red-600 shrink-0" />
          <span className="font-bold">{errorText}</span>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="font-bold">Access Limited: Workspace settings are Admin-only. Teammate changes are disabled.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Invite Teammate Card */}
        <div className="lg:col-span-1 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm h-fit space-y-4">
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
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-primary text-white text-xs font-bold py-2.5 rounded-xl shadow-md disabled:opacity-50 transition cursor-pointer"
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

        {/* 2. Workspace Member List */}
        <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
          <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Shield className="h-4 w-4 text-brand-primary animate-pulse" /> Workspace Member List
          </h5>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-brand-primary" />
              <span>Fetching team directory...</span>
            </div>
          ) : members.length > 0 ? (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left border-collapse text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-450 text-slate-400">
                    <th className="pb-2.5 font-bold">Member</th>
                    <th className="pb-2.5 font-bold">Role</th>
                    <th className="pb-2.5 font-bold">Status</th>
                    <th className="pb-2.5 font-bold">Joined</th>
                    <th className="pb-2.5 font-bold">Last Active</th>
                    {isAdmin && <th className="pb-2.5 text-right font-bold">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => {
                    const isSelf = member.id === currentUserId && !member.isInvitation;
                    const activeAdmins = members.filter((m) => m.role === "ADMIN" && m.status === "Active");
                    const isLastAdmin = member.role === "ADMIN" && member.status === "Active" && activeAdmins.length <= 1;

                    return (
                      <tr key={member.id} className="group hover:bg-slate-50/50">
                        {/* Member Identity */}
                        <td className="py-3 pr-3 flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-accent flex items-center justify-center text-[10px] font-black shrink-0 border border-brand-primary/10 shadow-2xs">
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate flex items-center gap-1">
                              {member.name}
                              {isSelf && <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded border">You</span>}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-3 pr-3">
                          <select
                            value={member.role}
                            disabled={!isAdmin || isSelf || isLastAdmin}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-700 rounded-lg p-1 outline-none disabled:opacity-75"
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 pr-3">
                          <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded border ${getStatusStyle(member.status)}`}>
                            {member.status}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="py-3 pr-3 text-[10px] text-slate-500 font-bold whitespace-nowrap">
                          {formatDate(member.createdAt)}
                        </td>

                        {/* Last Active */}
                        <td className="py-3 pr-3 text-[10px] text-slate-450 text-slate-400 font-bold whitespace-nowrap">
                          {formatLastActive(member.lastActive)}
                        </td>

                        {/* Actions Dropdown / Trash */}
                        {isAdmin && (
                          <td className="py-3 text-right relative">
                            {member.isInvitation ? (
                              <div className="inline-block text-left">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === member.id ? null : member.id);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                  title="Actions Menu"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                
                                <AnimatePresence>
                                  {activeMenuId === member.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setActiveMenuId(null)}
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 mt-1 w-44 rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-20 text-left overflow-hidden py-1"
                                      >
                                        <button
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            setViewModalData({ isOpen: true, member });
                                          }}
                                          className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                                          View Invitation
                                        </button>
                                        <button
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            const appUrl = window.location.origin;
                                            copyToClipboard(`${appUrl}/invite?token=${member.token}`);
                                          }}
                                          className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <Clipboard className="h-3.5 w-3.5 text-slate-400" />
                                          Copy Link
                                        </button>
                                        <button
                                          onClick={() => {
                                            setActiveMenuId(null);
                                            const appUrl = window.location.origin;
                                            window.open(`${appUrl}/invite?token=${member.token}`, "_blank");
                                          }}
                                          className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                          Open Invitation
                                        </button>
                                        <button
                                          onClick={() => handleRegenerateLink(member.id)}
                                          className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                                          Regenerate Link
                                        </button>
                                        <div className="border-t border-slate-100 my-1" />
                                        <button
                                          onClick={() => handleRemoveMember(member.id)}
                                          className="w-full text-left px-3 py-2 text-[11px] font-bold text-red-650 text-red-650 flex items-center gap-2 cursor-pointer text-red-600"
                                        >
                                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                          Cancel Invitation
                                        </button>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : isSelf ? (
                              <div className="w-7 h-7" /> // Hide delete icon for the logged-in ADMIN ("You")
                            ) : (
                              <button
                                disabled={isLastAdmin}
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-655 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-30 cursor-pointer"
                                title={isLastAdmin ? "Cannot remove last admin" : "Remove Teammate"}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium gap-2 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <span>No workspace members. Invite someone above to get started!</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Dialog Modal */}
      <SuccessDialog
        isOpen={!!inviteModalData?.isOpen}
        onClose={() => setInviteModalData(null)}
        title={inviteModalData?.title || ""}
        description={inviteModalData?.description || ""}
        url={inviteModalData?.inviteUrl || ""}
        copyLabel="Copy Invitation Link"
        openLabel="Open Invitation"
        toastTrigger={triggerToast}
      />

      {/* View Invitation Modal */}
      <AnimatePresence>
        {viewModalData?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden"
            >
              <button
                onClick={() => setViewModalData(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 text-center">
                  <h3 className="text-base font-bold text-slate-900">Invitation Details</h3>
                  <p className="text-xs text-slate-500">Secure workspace onboarding parameters.</p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="font-bold text-slate-400">Invitee Name</span>
                    <span className="font-bold text-slate-800">{viewModalData.member.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="font-bold text-slate-400">Email Address</span>
                    <span className="font-bold text-slate-800">{viewModalData.member.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="font-bold text-slate-400">Assigned Role</span>
                    <span className="font-bold text-slate-800">{viewModalData.member.role}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="font-bold text-slate-400">Workspace</span>
                    <span className="font-bold text-slate-800">{workspaceName || "LOOP"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="font-bold text-slate-400">Status</span>
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded border ${getStatusStyle(viewModalData.member.status)}`}>
                      {viewModalData.member.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="font-bold text-slate-400">Created Date</span>
                    <span className="font-bold text-slate-800">{formatDate(viewModalData.member.createdAt)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="font-bold text-slate-400">Expiry Date</span>
                    <span className="font-bold text-slate-800">
                      {viewModalData.member.expiresAt ? formatDate(viewModalData.member.expiresAt) : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Secure Invitation URL
                  </p>
                  <p className="text-xs text-slate-700 font-medium break-all select-all font-mono bg-white p-2 rounded-lg border border-slate-100">
                    {`${window.location.origin}/invite?token=${viewModalData.member.token}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      copyToClipboard(`${window.location.origin}/invite?token=${viewModalData.member.token}`);
                    }}
                    className="flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    <Clipboard className="h-3.5 w-3.5" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      window.open(`${window.location.origin}/invite?token=${viewModalData.member.token}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Link
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 border border-slate-800"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
