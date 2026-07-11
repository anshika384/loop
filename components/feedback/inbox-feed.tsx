"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Tag, Inbox, RefreshCw, ChevronLeft, ChevronRight, X, User } from "lucide-react";

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: "POS" | "NEU" | "NEG";
  sentimentScore: number;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
  themes: Array<{
    theme: {
      name: string;
      color: string;
    };
  }>;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface InboxFeedProps {
  userRole: string;
}

export default function InboxFeed({ userRole }: InboxFeedProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Selection Detail Modal
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

  // Team Assignment Mocks
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<Record<string, string>>({});

  const isViewer = userRole === "VIEWER";

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/feedback", window.location.origin);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "5");
      url.searchParams.set("sortBy", sortBy);
      if (search) url.searchParams.set("search", search);
      if (sentimentFilter) url.searchParams.set("sentiment", sentimentFilter);
      if (statusFilter) url.searchParams.set("status", statusFilter);
      if (channelFilter) url.searchParams.set("channel", channelFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setFeedbacks(json.data || []);
        setTotalItems(json.meta?.totalItems || 0);
        setTotalPages(json.meta?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search, sentimentFilter, statusFilter, channelFilter]);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const json = await res.json();
        setTeamMembers(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching team:", err);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (isViewer) return;
    try {
      const res = await fetch("/api/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: id, status: newStatus }),
      });
      if (res.ok) {
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: newStatus as any } : f))
        );
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem((prev) => prev ? { ...prev, status: newStatus as any } : null);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getSentimentStyles = (sent: string) => {
    switch (sent) {
      case "POS":
        return "text-green-600 bg-green-50 border-green-150 border-green-200";
      case "NEG":
        return "text-red-600 bg-red-50 border-red-150 border-red-200";
      default:
        return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Search */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search in feedback comments..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl pl-8 pr-4 py-2 focus:outline-none focus:border-brand-primary/30"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => {
              setSentimentFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none"
          >
            <option value="">All Sentiments</option>
            <option value="POS">Positive</option>
            <option value="NEU">Neutral</option>
            <option value="NEG">Negative</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTIONED">Actioned</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none"
          >
            <option value="">All Channels</option>
            <option value="Zendesk">Zendesk</option>
            <option value="Intercom">Intercom</option>
            <option value="App Store">App Store</option>
            <option value="Twitter">Twitter</option>
            <option value="Slack">Slack</option>
            <option value="Hubspot">Hubspot</option>
          </select>

          {/* Sort selection */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {totalItems} total logs
        </span>
      </div>

      {/* Main Inbox Feed */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-brand-primary" />
          <span>Processing database records...</span>
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-3">
          {feedbacks.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4 transition shadow-sm cursor-pointer"
            >
              <div className="space-y-2 flex-1 min-w-0 pr-4">
                <div className="flex gap-2 items-center text-[10px] font-bold">
                  <span className="text-slate-450 text-slate-500 uppercase">{item.channel}</span>
                  <span className="text-slate-300">•</span>
                  <span className={`px-2 py-0.5 rounded border ${getSentimentStyles(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                  {item.themes && item.themes.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-white font-bold"
                      style={{ backgroundColor: t.theme.color }}
                    >
                      {t.theme.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  "{item.content}"
                </p>
              </div>

              {/* Action columns */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {/* Assignment Select */}
                <div className="flex items-center gap-1.5 text-xs">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={assignedUsers[item.id] || ""}
                    disabled={isViewer}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      setAssignedUsers((prev) => ({ ...prev, [item.id]: e.target.value }));
                    }}
                    className="text-[10px] font-bold border border-slate-200 bg-white rounded-lg p-1 text-slate-700 outline-none"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Toggle Button */}
                <select
                  value={item.status}
                  disabled={isViewer}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className={`text-[10px] font-black border rounded-lg px-2 py-1 outline-none ${
                    item.status === "ACTIONED"
                      ? "bg-green-600 text-white border-green-600"
                      : item.status === "REVIEWED"
                      ? "bg-slate-200 text-slate-750 border-slate-300"
                      : "bg-brand-primary/5 text-brand-accent border-brand-primary/10"
                  }`}
                >
                  <option value="NEW">New</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="ACTIONED">Actioned</option>
                </select>
              </div>
            </div>
          ))}

          {/* Pagination controls */}
          <div className="flex justify-between items-center pt-4 text-xs font-bold text-slate-550 text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
          <Inbox className="h-10 w-10 text-slate-200 animate-pulse" />
          <span>No feedback records found. Load Seed data to explore feedbacks.</span>
        </div>
      )}

      {/* Details Slide-Over / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Feedback Details
              </span>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                  {selectedItem.channel}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSentimentStyles(selectedItem.sentiment)}`}>
                  {selectedItem.sentiment}
                </span>
              </div>
            </div>

            <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl text-xs text-slate-800 italic leading-relaxed">
              "{selectedItem.content}"
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">Classification Tag</span>
                <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 p-2 rounded-xl flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-brand-accent" />
                  {selectedItem.themes && selectedItem.themes[0] ? selectedItem.themes[0].theme.name : "General Comment"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">Sentiment Score</span>
                <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 p-2 rounded-xl block">
                  {(selectedItem.sentimentScore * 100).toFixed(0)}% Confidence
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
