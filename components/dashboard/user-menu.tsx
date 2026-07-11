"use client";

import { useState, useEffect } from "react";
import { LogOut, User, Building, Mail, Shield, Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
    createdAt: string;
    workspaceName: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Read avatar from localStorage
    const stored = localStorage.getItem("loop_avatar");
    if (stored) setAvatar(stored);

    const handleAvatarUpdate = () => {
      const updated = localStorage.getItem("loop_avatar");
      setAvatar(updated);
    };

    window.addEventListener("loop_avatar_updated", handleAvatarUpdate);
    return () => window.removeEventListener("loop_avatar_updated", handleAvatarUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.refresh();
        router.push("/login");
      } else {
        console.error("Logout request failed.");
      }
    } catch (err) {
      console.error("Logout request error:", err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-9 w-9 rounded-full overflow-hidden border border-slate-200 shadow-sm hover:opacity-90 transition focus:outline-none cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {avatar ? (
          <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white flex items-center justify-center font-bold text-xs">
            {getInitials(user.name)}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2.5 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header info */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                {avatar ? (
                  <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white flex items-center justify-center text-sm font-bold">
                    {getInitials(user.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  <Mail className="h-3 w-3 shrink-0" /> {user.email}
                </p>
              </div>
            </div>

            {/* Profile fields details */}
            <div className="space-y-2.5 text-xs text-slate-600 font-bold">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-400">
                  <Building className="h-3.5 w-3.5" /> Workspace:
                </span>
                <span className="font-extrabold text-slate-700 truncate max-w-[150px]">{user.workspaceName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-400">
                  <Shield className="h-3.5 w-3.5" /> Role:
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/5 text-brand-accent border border-brand-primary/10">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-slate-400">
                  <Calendar className="h-3.5 w-3.5" /> Joined:
                </span>
                <span className="font-extrabold text-slate-700">{user.createdAt}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2.5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Sign Out
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
