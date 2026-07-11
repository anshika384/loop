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

import { Flame, Group, Inbox, FileText, Sparkles, RefreshCw, BarChart3, Database, Users, HelpCircle, Activity } from "lucide-react";

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
  posPct: number;
  neuPct: number;
  negPct: number;
  totalUsers: number;
  totalReports: number;
  recentFeedbacks: any[];
  themes: any[];
  recentActivity: any[];
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeView, setActiveView] = useState("overview");
  const [needsSeeding, setNeedsSeeding] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  // Dynamic stats state
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Time filter filter range for charts
  const [daysFilter, setDaysFilter] = useState("30");

  const loadDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`/api/analytics?days=${daysFilter}`);
      if (res.ok) {
        const json = await res.json();
        const data: StatsData = json.data;
        setStats(data);
        setNeedsSeeding(data.totalFeedback === 0);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
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
                <div className="py-24 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-brand-primary" />
                  <span>Loading dashboard statistics...</span>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Ingested Comments</span>
                      <span className="text-xl font-black text-slate-800 block mt-1">{stats?.totalFeedback} items</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Positive Sentiment</span>
                      <span className="text-xl font-black text-green-600 block mt-1">{stats?.posPct}% Share</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Total Teammates</span>
                      <span className="text-xl font-black text-slate-800 block mt-1">{stats?.totalUsers} members</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Insights Generated</span>
                      <span className="text-xl font-black text-brand-accent block mt-1">{stats?.totalReports} Reports</span>
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
                                <span className="text-slate-400 uppercase">{item.channel}</span>
                                <span className={`px-1.5 py-0.5 rounded border ${getSentimentStyle(item.sentiment)}`}>
                                  {item.sentiment}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 italic leading-relaxed">
                                "{item.content.length > 80 ? item.content.slice(0, 78) + "..." : item.content}"
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-400">No feedbacks.</div>
                        )}
                      </div>
                    </div>

                    {/* Right - Recent Activity */}
                    <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Activity className="h-4 w-4 text-brand-primary" /> Workspace Activity Feed
                      </span>

                      <div className="space-y-3">
                        {stats?.recentActivity.map((act) => (
                          <div key={act.id} className="flex gap-3 text-xs leading-normal border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                            <div className="h-2 w-2 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-700">{act.action}</p>
                              <p className="text-[9px] text-slate-400">{act.target} • {act.time}</p>
                            </div>
                          </div>
                        ))}
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
              <InboxFeed userRole={user.role} />
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
              <SentimentTimeline />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SentimentDonut />
                <CategoryBars />
              </div>
              <SourceBars />
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
                {[
                  { title: "Invoice download fails on PDF format button click", count: 48, status: "Critical Spiking", source: "Intercom & Hubspot", color: "bg-red-500/10 text-red-600 border-red-200" },
                  { title: "Users requesting dark theme toggle setting options", count: 32, status: "Feature Request", source: "App Store & Twitter", color: "bg-brand-primary/10 text-brand-accent border-brand-primary/10" },
                  { title: "Android browser latency issues on credit card input", count: 18, status: "Active Bug", source: "Zendesk ticket logs", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200" },
                ].map((theme, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 bg-slate-50 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-md transition animate-in fade-in duration-200"
                  >
                    <div className="space-y-1.5 min-w-0 pr-4">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${theme.color}`}>
                        {theme.status}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800 truncate leading-snug">{theme.title}</h5>
                      <span className="text-[9px] text-slate-400 font-medium block">Source: {theme.source}</span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-slate-800 block">{theme.count}</span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500 block">Comments</span>
                    </div>
                  </div>
                ))}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual SVG metrics in Alert view */}
                <div className="border border-slate-200 p-5 rounded-2xl bg-white shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700">Daily Spikes Anomaly Index</span>
                    <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded">3 Surges Detected</span>
                  </div>
                  <div className="h-44 flex items-end justify-between gap-2.5">
                    {[10, 15, 8, 45, 12, 6, 22].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${val > 30 ? "bg-red-500" : "bg-slate-250 bg-slate-300"}`}
                          style={{ height: `${(val / 50) * 120}px` }}
                        />
                        <span className="text-[8px] text-slate-400 font-bold">Day {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-200 p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-black text-slate-750 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Flame className="h-4 w-4 text-red-500" /> Active Alert Spikes
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      Stripe checkout transaction latency has surged by 180% in the last 1 hour. This correlates with high Android browser card input lags.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Detected: 24m ago</span>
                    <span className="text-brand-accent">Analyze themes →</span>
                  </div>
                </div>
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
              <TeamManager userRole={user.role} currentUserId={user.id} />
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
              <SettingsManager
                userRole={user.role}
                initialWorkspaceName={stats?.workspaceName || user.workspaceName}
                userName={user.name}
                userEmail={user.email}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
