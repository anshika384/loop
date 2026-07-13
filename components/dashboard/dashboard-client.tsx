"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DashboardLayout from "./dashboard-layout";

// Newly created modular components
import SentimentTimeline from "../charts/sentiment-timeline";
import CategoryBars from "../charts/category-bars";
import SentimentDonut from "../charts/sentiment-donut";
import SourceBars from "../charts/source-bars";
import InboxFeed from "../feedback/inbox-feed";
import ImportManager from "../feedback/import-manager";
import AIAnalysisCenter from "../ai/ai-analysis-center";
import ExecutiveReports from "../reports/executive-reports";
import TeamManager from "../users/team-manager";
import SettingsManager from "../layout/settings-manager";

import { Flame, Group, Inbox, FileText, Sparkles, RefreshCw, BarChart3, Database, Users, HelpCircle, Activity, ShieldAlert } from "lucide-react";

interface DashboardClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    workspaceName: string;
  };
}

interface StatsData {
  workspaceName: string;
  userRole: string;
  totalFeedback: number;
  totalFeedbackOverall: number;
  totalUsers: number;
  newFeedbackThisWeek: number;
  newFeedbackCount: number;
  reviewedFeedbackCount: number;
  actionedFeedbackCount: number;
  assignedFeedbackCount: number;
  unassignedFeedbackCount: number;
  posPct: number;
  neuPct: number;
  negPct: number;
  posCount: number;
  neuCount: number;
  negCount: number;
  totalReports: number;
  recentFeedbacks: any[];
  topThemesData: any[];
  sourceData: any[];
  timelineData: any[];
  recentActivity: any[];
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeView, setActiveView] = useState("overview");
  const [needsSeeding, setNeedsSeeding] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dynamic stats state
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Time filter filter range for charts
  const [daysFilter, setDaysFilter] = useState("30");

  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return "";
    const timeMs = new Date(dateStr).getTime();
    const deltaSeconds = Math.round((Date.now() - timeMs) / 1000);
    const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, Infinity];
    const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month"];
    const unitIndex = cutoffs.findIndex(cutoff => deltaSeconds < cutoff);
    
    if (unitIndex === 0) return "Just now";
    
    const divisor = unitIndex === 1 ? 60 : unitIndex === 2 ? 3600 : unitIndex === 3 ? 86400 : unitIndex === 4 ? 86400 * 7 : 86400 * 30;
    const count = Math.floor(deltaSeconds / divisor);
    
    try {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(-count, units[unitIndex - 1]);
    } catch (e) {
      if (unitIndex === 1) return `${count}m ago`;
      if (unitIndex === 2) return `${count}h ago`;
      if (unitIndex === 3) return `${count}d ago`;
      return new Date(timeMs).toLocaleDateString();
    }
  };

  const loadDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?days=${daysFilter}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const data: StatsData = json.data;
          setStats(data);
          setNeedsSeeding(data.totalFeedbackOverall === 0);
        } else {
          setError(json.message || "Failed to load dashboard metrics.");
        }
      } else {
        setError("Failed to fetch dashboard metrics from the server.");
      }
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoadingStats(false);
    }
  }, [daysFilter]);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const handleSeedWorkspace = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
      });
      if (res.ok) {
        await loadDashboardStats();
        setNeedsSeeding(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const getSentimentStyle = (sent: string) => {
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

  return (
    <DashboardLayout
      user={user}
      activeView={activeView}
      onViewChange={(view) => setActiveView(view)}
    >
      <div className="p-6 relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* 1. Dashboard Overview View */}
          {activeView === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-3 flex flex-wrap gap-4 justify-between items-center">
                <div>
                  <h4 className="text-base font-bold text-slate-800">SaaS Workspace Overview</h4>
                  <p className="text-xs text-slate-500">Live operational review for {stats?.workspaceName || user.workspaceName}.</p>
                </div>

                {/* Days Filter */}
                <select
                  value={daysFilter}
                  onChange={(e) => setDaysFilter(e.target.value)}
                  className="text-xs border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last Year</option>
                </select>
              </div>

              {loadingStats ? (
                /* Skeleton Loader for the Overview */
                <div className="space-y-6 animate-pulse">
                  {/* KPI cards skeleton */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                        <div className="h-2 w-16 bg-slate-200 rounded"></div>
                        <div className="h-5 w-24 bg-slate-200 rounded mt-2"></div>
                      </div>
                    ))}
                  </div>

                  {/* Split grid skeleton */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left feedback list skeleton */}
                    <div className="lg:col-span-3 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                      <div className="h-4 w-40 bg-slate-200 rounded"></div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="border border-slate-100 bg-slate-50/50 p-3 rounded-xl space-y-2">
                            <div className="flex justify-between">
                              <div className="h-3 w-20 bg-slate-200 rounded"></div>
                              <div className="h-3 w-10 bg-slate-200 rounded"></div>
                            </div>
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right activity feed skeleton */}
                    <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                      <div className="h-4 w-32 bg-slate-200 rounded"></div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex gap-3">
                            <div className="h-2 w-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                              <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                /* Error state card with retry */
                <div className="border border-red-200 bg-red-50/50 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm my-12">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-slate-800">Connection Error</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={loadDashboardStats}
                    className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl mx-auto shadow hover:bg-slate-800 transition cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Connection
                  </button>
                </div>
              ) : needsSeeding ? (
                /* Welcome CTA to load demo records */
                <div className="border border-brand-primary/20 bg-brand-primary/5 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-sm">
                  <Database className="h-10 w-10 text-brand-accent mx-auto animate-pulse" />
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-slate-800">Seeding Required</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Welcome to LOOP! Populate this workspace with demo records (15 feedbacks, 3 AI themes, and 1 executive report) to experience the product walkthrough.
                    </p>
                  </div>
                  <button
                    onClick={handleSeedWorkspace}
                    disabled={seeding}
                    className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl mx-auto shadow hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
                  >
                    {seeding ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Load Workspace Demo Data
                  </button>
                </div>
              ) : (
                /* Standard KPI Widgets */
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Total Feedback</span>
                      <span className="text-xl font-black text-slate-800 block mt-1">{stats?.totalFeedbackOverall} items</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">New Feedback</span>
                      <span className="text-xl font-black text-purple-600 block mt-1">{stats?.newFeedbackCount} items</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Reviewed Feedback</span>
                      <span className="text-xl font-black text-amber-500 block mt-1">{stats?.reviewedFeedbackCount} items</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Actioned Feedback</span>
                      <span className="text-xl font-black text-green-650 text-green-600 block mt-1">{stats?.actionedFeedbackCount} items</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Assigned Feedback</span>
                      <span className="text-xl font-black text-slate-800 block mt-1">{stats?.assignedFeedbackCount} items</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Unassigned Feedback</span>
                      <span className="text-xl font-black text-slate-800 block mt-1">{stats?.unassignedFeedbackCount} items</span>
                    </div>
                  </div>

                  {/* Summary split grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left - Recent Feedbacks */}
                    <div className="lg:col-span-3 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Inbox className="h-4 w-4 text-slate-400" /> Recent Ingested Feedback
                      </span>

                      <div className="space-y-3">
                        {stats?.recentFeedbacks && stats.recentFeedbacks.length > 0 ? (
                          stats.recentFeedbacks.map((item) => (
                            <div
                              key={item.id}
                              className="border border-slate-100 bg-slate-50/50 p-3 rounded-xl space-y-1.5"
                            >
                              <div className="flex justify-between items-center text-[9px] font-bold">
                                <div className="flex items-center gap-1.5 text-slate-400 uppercase">
                                  <span>{item.channel}</span>
                                  <span>•</span>
                                  <span>{getRelativeTime(item.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded border ${getSentimentStyle(item.sentiment)}`}>
                                    {item.sentiment}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded border ${getStatusStyle(item.status)}`}>
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-700 italic leading-relaxed">
                                "{item.content.length > 80 ? item.content.slice(0, 78) + "..." : item.content}"
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium gap-2 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                            <span>No feedbacks logged in this workspace yet.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right - Recent Activity */}
                    <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Activity className="h-4 w-4 text-brand-primary" /> Workspace Activity Feed
                      </span>

                      <div className="space-y-3">
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                          stats.recentActivity.map((act) => (
                            <div key={act.id} className="flex gap-3 text-xs leading-normal border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <div className="h-2 w-2 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-700">{act.action}</p>
                                <p className="text-[9px] text-slate-400">{act.target} • {getRelativeTime(act.time)}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium gap-2 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                            <span>No workspace activity recorded yet.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 2. Feedback Inbox View */}
          {activeView === "inbox" && (
            <motion.div
              key="inbox"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <InboxFeed user={user} onStatusChange={loadDashboardStats} />
            </motion.div>
          )}

          {/* 3. Feedback Import View */}
          {activeView === "import" && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <ImportManager userRole={user.role} onImportSuccess={loadDashboardStats} />
            </motion.div>
          )}

          {/* 4. Analytics Core View */}
          {activeView === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <SentimentTimeline data={stats?.timelineData} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SentimentDonut data={stats?.posPct || stats?.neuPct || stats?.negPct ? [
                  { name: "Positive", value: stats.posPct, color: "#10B981" },
                  { name: "Neutral", value: stats.neuPct, color: "#94A3B8" },
                  { name: "Negative", value: stats.negPct, color: "#EF4444" }
                ] : []} />
                <CategoryBars data={stats?.topThemesData} />
              </div>
              <SourceBars data={stats?.sourceData} />
            </motion.div>
          )}

          {/* 5. AI Assistant View */}
          {activeView === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <AIAnalysisCenter />
            </motion.div>
          )}

          {/* 6. Theme Clusters View */}
          {activeView === "themes" && (
            <motion.div
              key="themes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-800">AI-Clustered Problem Themes</h4>
                <p className="text-xs text-slate-500">Underlying root causes aggregated from repetitive customer complaints.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats?.topThemesData && stats.topThemesData.length > 0 ? (
                  stats.topThemesData.map((theme) => (
                    <div
                      key={theme.id}
                      className="border border-slate-200 bg-slate-50 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition animate-in fade-in duration-200"
                    >
                      <div className="space-y-1.5 min-w-0 pr-4">
                        <span 
                          className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                          style={{ backgroundColor: `${theme.color}10`, color: theme.color, borderColor: `${theme.color}20` }}
                        >
                          Theme Cluster
                        </span>
                        <h5 className="text-xs font-bold text-slate-800 truncate leading-snug">{theme.name}</h5>
                        {theme.description && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mt-1">{theme.description}</p>
                        )}
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-slate-800 block">{theme.volume}</span>
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500 block">Comments</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="sm:col-span-2 py-16 flex flex-col items-center justify-center text-center text-slate-450 text-slate-400 text-xs font-medium gap-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <span className="text-2xl">📊</span>
                    <span className="font-extrabold text-slate-700">No Theme Clusters Available</span>
                    <span className="max-w-xs text-[11px] text-slate-500">
                      AI clustering has not been executed yet. Theme clusters will appear automatically once customer feedback has been analyzed.
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 7. Trend Detection View */}
          {activeView === "alerts" && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-800">Trend & Anomaly Detection</h4>
                <p className="text-xs text-slate-500">Live AI trend monitors tracing anomaly surges.</p>
              </div>

              <div className="border border-slate-200 p-8 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center text-center min-h-[300px] gap-3 border-2 border-dashed border-slate-200 bg-slate-50/30">
                <span className="text-3xl animate-pulse">📈</span>
                <h4 className="text-sm font-extrabold text-slate-855 text-slate-800">No Trend Analysis Available</h4>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Trend detection has not been executed yet. LOOP will automatically detect spikes after enough customer feedback has been processed.
                </p>
              </div>
            </motion.div>
          )}

          {/* 8. VoC Reports View */}
          {activeView === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <ExecutiveReports userRole={user.role} />
            </motion.div>
          )}

          {/* 9. Team Management View */}
          {activeView === "team" && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {user.role === "ADMIN" ? (
                <TeamManager userRole={user.role} currentUserId={user.id} workspaceName={stats?.workspaceName || user.workspaceName} />
              ) : (
                <div className="p-8 text-center border border-red-200 bg-red-50/50 rounded-2xl max-w-xl mx-auto shadow-sm my-12 space-y-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-650 text-red-600">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">403 Forbidden - Access Denied</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    You do not have permission to view or manage the Team Directory. Teammate administration is reserved for workspace Admins.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* 10. Settings View */}
          {activeView === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {user.role === "ADMIN" ? (
                <SettingsManager
                  userRole={user.role}
                  initialWorkspaceName={stats?.workspaceName || user.workspaceName}
                  userName={user.name}
                  userEmail={user.email}
                />
              ) : (
                <div className="p-8 text-center border border-red-200 bg-red-50/50 rounded-2xl max-w-xl mx-auto shadow-sm my-12 space-y-4">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-650 text-red-600">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">403 Forbidden - Access Denied</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    You do not have permission to modify workspace configurations. Workspace settings are reserved for workspace Admins.
                  </p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
