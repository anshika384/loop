"use client";

import { useState } from "react";
import { Bell, Flame, CheckCircle, UserPlus, Info } from "lucide-react";

interface NotificationItem {
  id: string;
  type: "trend" | "import" | "team" | "info";
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      type: "trend",
      title: "Active Trend Detected",
      desc: "Stripe checkout failures spiking (180% increase in 1 hour).",
      time: "24m ago",
      read: false,
    },
    {
      id: "2",
      type: "import",
      title: "Bulk CSV Ingest Completed",
      desc: "Ingested and analyzed 120 customer feedback items.",
      time: "1h ago",
      read: false,
    },
    {
      id: "3",
      type: "team",
      title: "New Team Member",
      desc: "Sarah Jenkins joined your workspace as an ANALYST.",
      time: "2h ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <Flame className="h-4 w-4 text-red-500" />;
      case "import":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "team":
        return <UserPlus className="h-4 w-4 text-brand-primary" />;
      default:
        return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-655 hover:bg-slate-50 transition-colors focus:outline-none shrink-0"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5 shrink-0 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[8px] font-black text-white flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-20 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <span className="text-xs font-black text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-brand-accent hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleRead(item.id)}
                    className={`flex gap-3 p-2 rounded-xl border border-transparent transition cursor-pointer hover:bg-slate-50 ${
                      !item.read ? "bg-slate-50/50 border-slate-100" : ""
                    }`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex justify-between items-start">
                        <p className={`text-[10px] truncate leading-none ${!item.read ? "font-bold text-slate-800" : "text-slate-655 text-slate-600"}`}>
                          {item.title}
                        </p>
                        <span className="text-[8px] text-slate-400 font-medium whitespace-nowrap ml-1">{item.time}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-tight line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-[10px] text-slate-400 font-bold">
                  No active alerts.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
