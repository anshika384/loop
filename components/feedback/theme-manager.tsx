"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Tag, RefreshCw, X, Sparkles, BarChart3, Calendar, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackRelation {
  id: string;
  content: string;
  channel: string;
  sentiment: "POS" | "NEU" | "NEG" | null;
  sentimentScore: number | null;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
  confidence: number;
}

interface ThemeItem {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  feedbackCount: number;
  posCount: number;
  neuCount: number;
  negCount: number;
  averageConfidence: number;
  mostRecentFeedbackTime: string | null;
  feedbacks: FeedbackRelation[];
}

interface ThemeManagerProps {
  userRole: string;
}

export default function ThemeManager({ userRole }: ThemeManagerProps) {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessResult, setReprocessResult] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("most_feedback");

  // Selected Theme for Details Slide-over
  const [selectedTheme, setSelectedTheme] = useState<ThemeItem | null>(null);

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/themes");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setThemes(json.data || []);
        } else {
          setError(json.message || "Failed to load theme data.");
        }
      } else {
        setError("HTTP error loading themes from backend.");
      }
    } catch (err) {
      console.error("Error fetching themes:", err);
      setError("Failed to fetch workspace themes. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const runReprocess = useCallback(async () => {
    setReprocessing(true);
    setReprocessResult(null);
    try {
      const res = await fetch("/api/themes/reprocess", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setReprocessResult(`✓ Clustered ${json.processed} feedback item(s) into themes.`);
        await fetchThemes();
      } else {
        setReprocessResult(`Failed: ${json.message}`);
      }
    } catch (err) {
      setReprocessResult("Error calling reprocess endpoint.");
    } finally {
      setReprocessing(false);
    }
  }, [fetchThemes]);

  // Relative Time Helper
  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return "No activity";
    const timeMs = new Date(dateStr).getTime();
    const deltaSeconds = Math.round((Date.now() - timeMs) / 1000);
    const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, Infinity];
    const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month"];
    const unitIndex = cutoffs.findIndex((cutoff) => deltaSeconds < cutoff);

    if (unitIndex === 0) return "Just now";

    const divisor =
      unitIndex === 1
        ? 60
        : unitIndex === 2
        ? 3600
        : unitIndex === 3
        ? 86400
        : unitIndex === 4
        ? 86400 * 7
        : 86400 * 30;
    const count = Math.floor(deltaSeconds / divisor);

    try {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(-count, units[unitIndex - 1]);
    } catch (e) {
      return new Date(timeMs).toLocaleDateString();
    }
  };

  const getSentimentStyle = (sent: string | null) => {
    switch (sent) {
      case "POS":
        return "text-green-600 bg-green-50 border-green-200";
      case "NEG":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "NEW":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "REVIEWED":
        return "text-indigo-600 bg-indigo-50 border-indigo-200";
      case "ACTIONED":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default:
        return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  // Filter & Sort computation
  const filteredThemes = themes
    .filter((theme) => {
      const query = searchQuery.toLowerCase().trim();
      return (
        theme.name.toLowerCase().includes(query) ||
        theme.description.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "newest":
          const aTime = a.mostRecentFeedbackTime ? new Date(a.mostRecentFeedbackTime).getTime() : 0;
          const bTime = b.mostRecentFeedbackTime ? new Date(b.mostRecentFeedbackTime).getTime() : 0;
          return bTime - aTime;
        case "highest_confidence":
          return b.averageConfidence - a.averageConfidence;
        case "most_feedback":
        default:
          return b.feedbackCount - a.feedbackCount;
      }
    });

  // Calculate overall stats
  const totalVolume = themes.reduce((sum, t) => sum + t.feedbackCount, 0);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Text Search */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search theme clusters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl pl-8 pr-4 py-2 focus:outline-none focus:border-brand-primary/30"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Sort selection */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none"
          >
            <option value="most_feedback">Most Feedback</option>
            <option value="newest">Newest Activity</option>
            <option value="highest_confidence">Highest Confidence</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {reprocessResult && (
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1.5">
              {reprocessResult}
            </span>
          )}
          <button
            onClick={runReprocess}
            disabled={reprocessing}
            className="text-xs text-white font-bold flex items-center gap-1.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl px-3 py-1.5 transition-all shadow-sm"
          >
            <Sparkles className={`h-3.5 w-3.5 ${reprocessing ? "animate-pulse" : ""}`} />
            {reprocessing ? "Clustering..." : "Run AI Clustering"}
          </button>
          <button
            onClick={fetchThemes}
            className="text-xs text-slate-500 font-bold flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Reload
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-brand-primary" />
          <span>Analyzing workspace theme clusters...</span>
        </div>
      ) : error ? (
        <div className="border border-red-200 bg-red-50/50 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm my-12">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-655 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={fetchThemes}
            className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl mx-auto shadow hover:bg-slate-800 transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredThemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredThemes.map((theme) => {
            const posPercent = theme.feedbackCount > 0 ? Math.round((theme.posCount / theme.feedbackCount) * 100) : 0;
            const neuPercent = theme.feedbackCount > 0 ? Math.round((theme.neuCount / theme.feedbackCount) * 100) : 0;
            const negPercent = theme.feedbackCount > 0 ? Math.round((theme.negCount / theme.feedbackCount) * 100) : 0;

            return (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className="border border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition cursor-pointer relative overflow-hidden group hover:border-slate-300"
              >
                {/* Colored Top Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: theme.color }}
                />

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 min-w-0 pr-4">
                      <span
                        className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${theme.color}10`,
                          color: theme.color,
                          borderColor: `${theme.color}20`,
                        }}
                      >
                        Theme Cluster
                      </span>
                      <h4 className="text-sm font-black text-slate-800 truncate leading-snug group-hover:text-brand-primary transition-colors">
                        {theme.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-slate-800 block leading-none">
                        {theme.feedbackCount}
                      </span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block mt-0.5">
                        Comments
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                {/* Card footer details */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
                  {/* Sentiment Bar */}
                  <div className="flex gap-1 items-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 mr-1 uppercase">Sentiment:</span>
                    <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-150 border-green-200">
                      {theme.posCount}
                    </span>
                    <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                      {theme.neuCount}
                    </span>
                    <span className="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-150 border-red-200">
                      {theme.negCount}
                    </span>
                  </div>

                  {/* Confidence and Date */}
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold ml-auto">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-slate-400" />
                      <span>{(theme.averageConfidence * 100).toFixed(0)}% Match</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>{getRelativeTime(theme.mostRecentFeedbackTime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-indigo-500" />
          </div>
          <div className="space-y-1.5 text-center">
            <p className="text-sm font-black text-slate-800">No Theme Clusters Yet</p>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              {themes.length === 0
                ? "Your existing feedback hasn't been clustered into themes yet. Click below to run AI clustering on all imported feedback."
                : "No themes match your current search query."}
            </p>
          </div>
          {themes.length === 0 && (
            <button
              onClick={runReprocess}
              disabled={reprocessing}
              className="text-sm text-white font-bold flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl px-5 py-2.5 transition-all shadow-md"
            >
              <Sparkles className={`h-4 w-4 ${reprocessing ? "animate-pulse" : ""}`} />
              {reprocessing ? "Running AI Clustering..." : "Run AI Theme Clustering"}
            </button>
          )}
          {reprocessResult && (
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5">
              {reprocessResult}
            </span>
          )}
        </div>
      )}

      {/* Details Slide-Over */}
      <AnimatePresence>
        {selectedTheme && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-end backdrop-blur-xs">
            {/* Modal Panel Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTheme(null)}
              className="absolute inset-0"
            />

            {/* Slide-over panel content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between z-10 p-6 border-l border-slate-100"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedTheme(null)}
                className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
                {/* Theme Profile Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: selectedTheme.color }}
                    />
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                      AI Clustered Theme
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 leading-snug">
                    {selectedTheme.name}
                  </h3>
                  <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200/50 p-4 rounded-xl leading-relaxed italic">
                    "{selectedTheme.description}"
                  </p>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                    <span className="text-lg font-black text-slate-800 block">
                      {selectedTheme.feedbackCount}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mt-1">
                      Total Comments
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                    <span className="text-lg font-black text-slate-800 block">
                      {(selectedTheme.averageConfidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mt-1">
                      Avg AI Confidence
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                    <span className="text-[9px] font-black text-slate-700 block truncate max-w-full">
                      {getRelativeTime(selectedTheme.mostRecentFeedbackTime)}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mt-2">
                      Last Updated
                    </span>
                  </div>
                </div>

                {/* Sentiment Breakdown Metrics */}
                <div className="space-y-2 border border-slate-200 rounded-2xl p-5">
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <BarChart3 className="h-4 w-4 text-slate-400" /> Sentiment Distribution
                  </span>

                  <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-green-50/50 border border-green-100 text-green-700 font-bold">
                      <span className="block text-base font-black leading-none mb-1">
                        {selectedTheme.posCount}
                      </span>
                      Positive (
                      {selectedTheme.feedbackCount > 0
                        ? Math.round((selectedTheme.posCount / selectedTheme.feedbackCount) * 100)
                        : 0}
                      %)
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-slate-700 font-bold">
                      <span className="block text-base font-black leading-none mb-1">
                        {selectedTheme.neuCount}
                      </span>
                      Neutral (
                      {selectedTheme.feedbackCount > 0
                        ? Math.round((selectedTheme.neuCount / selectedTheme.feedbackCount) * 100)
                        : 0}
                      %)
                    </div>
                    <div className="p-2.5 rounded-xl bg-red-50/50 border border-red-100 text-red-750 text-red-650 text-red-600 font-bold">
                      <span className="block text-base font-black leading-none mb-1">
                        {selectedTheme.negCount}
                      </span>
                      Negative (
                      {selectedTheme.feedbackCount > 0
                        ? Math.round((selectedTheme.negCount / selectedTheme.feedbackCount) * 100)
                        : 0}
                      %)
                    </div>
                  </div>
                </div>

                {/* Feedbacks Listing */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-700 block border-b border-slate-100 pb-2">
                    Associated Workspace Feedback Logs ({selectedTheme.feedbackCount})
                  </span>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {selectedTheme.feedbacks && selectedTheme.feedbacks.length > 0 ? (
                      selectedTheme.feedbacks.map((fb) => (
                        <div
                          key={fb.id}
                          className="border border-slate-100 bg-slate-50/60 p-3.5 rounded-xl space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap justify-between items-center gap-2 text-[9px] font-bold text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className="uppercase">{fb.channel}</span>
                              <span>•</span>
                              <span>{new Date(fb.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-1.5 items-center">
                              <span className={`px-1.5 py-0.5 rounded border ${getSentimentStyle(fb.sentiment)}`}>
                                {fb.sentiment || "NEU"}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded border ${getStatusStyle(fb.status)}`}>
                                {fb.status}
                              </span>
                              <span className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600">
                                {(fb.confidence * 100).toFixed(0)}% match
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-800 font-medium italic leading-relaxed">
                            "{fb.content}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                        No feedback items linked to this theme yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Actions Footer */}
              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="px-5 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                >
                  Close Detailed View
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
