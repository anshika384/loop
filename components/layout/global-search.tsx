"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, Group, User, Inbox, X } from "lucide-react";

interface SearchResult {
  category: "feedback" | "theme" | "report" | "member";
  title: string;
  desc: string;
  action: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const allItems: SearchResult[] = [
    { category: "feedback", title: "Stripe error 402", desc: "Android client billing bug reviews", action: "inbox" },
    { category: "feedback", title: "Safari lag on export", desc: "Performance & latency invoice reports issues", action: "inbox" },
    { category: "theme", title: "Payment Failures & Currency", desc: "AI-clustered root theme with 5 comments", action: "themes" },
    { category: "theme", title: "Performance & Latency", desc: "AI-clustered system performance logs", action: "themes" },
    { category: "report", title: "Weekly Feedback Summary & Recommendations", desc: "Voice of Customer executive summary", action: "reports" },
    { category: "member", title: "Sarah Jenkins", desc: "Workspace ANALYST", action: "settings" },
    { category: "member", title: "David Miller", desc: "Workspace VIEWER", action: "settings" },
  ];

  const filtered = query
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.desc.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (cat: string) => {
    switch (cat) {
      case "feedback":
        return <Inbox className="h-3.5 w-3.5 text-slate-400" />;
      case "theme":
        return <Group className="h-3.5 w-3.5 text-brand-primary" />;
      case "report":
        return <FileText className="h-3.5 w-3.5 text-indigo-500" />;
      default:
        return <User className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-64">
      <div className="relative">
        <input
          type="text"
          placeholder="Global search (press '/' to focus)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl pl-8 pr-8 py-2 focus:outline-none placeholder-slate-400 focus:border-brand-primary/30 transition-colors"
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {isOpen && query && (
        <div className="absolute left-0 mt-2.5 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex justify-between">
            <span>Search Results</span>
            <span>{filtered.length} matched</span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    // Mocks routing or active view changes in layout
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs"
                >
                  <div className="h-7 w-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {getIcon(item.category)}
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="font-extrabold text-slate-700 truncate">{item.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold truncate">{item.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-[10px] text-slate-400 font-bold">
                No matching indexes found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
