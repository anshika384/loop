"use client";

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
}

export default function TopNavbar({ activeView, user }: TopNavbarProps) {
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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 flex-shrink-0">
      {/* Title / Breadcrumbs */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400">app.loop.ai</span>
        <span className="text-slate-300">/</span>
        <h1 className="text-sm font-bold text-slate-800 tracking-tight">
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
