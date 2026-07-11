"use client";

import { Sparkles, Inbox, BarChart3, Group, MessageSquare, Bell, FileText, Settings, LayoutDashboard, UploadCloud, Users } from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  workspaceName: string;
}

export default function Sidebar({ activeView, onViewChange, workspaceName }: SidebarProps) {
  const sections = [
    {
      title: "Feedback",
      items: [
        { id: "inbox", label: "Inbox", icon: Inbox },
        { id: "import", label: "Import Data", icon: UploadCloud },
      ],
    },
    {
      title: "AI Intelligence",
      items: [
        { id: "chat", label: "AI Assistant", icon: MessageSquare },
        { id: "themes", label: "Theme Clusters", icon: Group },
        { id: "alerts", label: "Trend Detection", icon: Bell },
      ],
    },
    {
      title: "Analytics",
      items: [
        { id: "analytics", label: "Interactive Charts", icon: BarChart3 },
        { id: "reports", label: "VoC Reports", icon: FileText },
      ],
    },
    {
      title: "Workspace",
      items: [
        { id: "team", label: "Team Directory", icon: Users },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 text-slate-300 flex flex-col h-screen overflow-hidden select-none shrink-0">
      {/* Workspace Header */}
      <div className="flex items-center gap-3.5 px-6 py-5 border-b border-slate-800 bg-slate-950 shrink-0">
        <img src="/logo.png" alt="LOOP Logo" className="h-11 w-auto max-w-[125px] object-contain rounded-lg shadow-md shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black text-brand-primary tracking-wider uppercase">Workspace</p>
          <h2 className="text-[13px] font-black text-white truncate" title={workspaceName}>
            {workspaceName}
          </h2>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-5 space-y-4 overflow-hidden">
        {/* Top-Level Dashboard Link */}
        <div className="space-y-1">
          <button
            onClick={() => onViewChange("overview")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-extrabold transition-all duration-150 cursor-pointer ${
              activeView === "overview"
                ? "bg-brand-primary/20 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <LayoutDashboard className={`h-4.5 w-4.5 shrink-0 ${activeView === "overview" ? "text-brand-primary" : "text-slate-500"}`} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Section Groups */}
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <span className="px-3.5 text-[9.5px] font-black uppercase tracking-widest text-slate-505 text-slate-550 text-slate-500 block">
              {sec.title}
            </span>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-extrabold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-brand-primary/20 text-white shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-brand-primary" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
