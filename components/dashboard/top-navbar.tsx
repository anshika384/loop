"use client";

import { Menu } from "lucide-react";
import GlobalSearch from "../layout/global-search";
import NotificationCenter from "../layout/notification-center";
import UserMenu from "./user-menu";

interface TopNavbarProps {
  activeView: string;
  user: {
    name: string;
    email: string;
    role: string;
    createdAt: string;
    workspaceName: string;
  };
  onToggleMobileSidebar: () => void;
}

export default function TopNavbar({ activeView, user, onToggleMobileSidebar }: TopNavbarProps) {
  const getPanelTitle = (id: string) => {
    switch (id) {
      case "overview":
        return "Dashboard Overview";
      case "analytics":
        return "Analysis Core";
      case "inbox":
        return "Feedback Inbox";
      case "import":
        return "Log & Import Feedback";
      case "chat":
        return "Ask LOOP AI";
      case "themes":
        return "Theme Clustering";
      case "alerts":
        return "Trend Spikes";
      case "reports":
        return "Voice of Customer Reports";
      case "team":
        return "Team Directory";
      case "settings":
        return "Settings";
      default:
        return "Dashboard Core";
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 py-4 flex-shrink-0 gap-3">
      {/* Title / Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-xs font-bold text-slate-400 hidden sm:inline shrink-0">app.loop.ai</span>
        <span className="text-slate-300 hidden sm:inline shrink-0">/</span>
        <h1 className="text-sm font-bold text-slate-800 tracking-tight truncate">
          {getPanelTitle(activeView)}
        </h1>
      </div>

      {/* Tools / Actions */}
      <div className="flex items-center gap-4">
        {/* Global Search Component */}
        <GlobalSearch />

        {/* Notification Center Popover */}
        <NotificationCenter />

        {/* User Menu Dropdown */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
