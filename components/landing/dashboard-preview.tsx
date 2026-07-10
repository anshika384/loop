"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, BarChart3, Group, MessageSquare, Sparkles, Send, Bell, FileText, RefreshCw, Tag, ArrowUpRight, Flame, Download, CheckCircle, AlertTriangle } from "lucide-react";
import { Variants } from "framer-motion";

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState<string>("analytics");
  const [isPaused, setIsPaused] = useState(false);
  
  // Ask LOOP AI tab state
  const [typedPrompt, setTypedPrompt] = useState("");
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const tabs = [
    { id: "analytics", label: "Analytics Dashboard", icon: BarChart3 },
    { id: "inbox", label: "Feedback Inbox", icon: Inbox },
    { id: "chat", label: "Ask LOOP AI", icon: MessageSquare },
    { id: "themes", label: "Theme Clustering", icon: Group },
    { id: "alerts", label: "Trend Detection", icon: Bell },
    { id: "reports", label: "VoC Reports", icon: FileText },
  ];

  // Auto-rotate tabs every 4 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const currentIdx = tabs.findIndex((t) => t.id === prev);
        const nextIdx = (currentIdx + 1) % tabs.length;
        return tabs[nextIdx].id;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsPaused(true); // Pause rotation upon user manual selection
    if (tabId !== "chat") {
      setTypedPrompt("");
      setChatAnswer(null);
    }
  };

  const handlePromptClick = (prompt: string, answer: string) => {
    setIsPaused(true);
    setChatAnswer(null);
    setTypedPrompt("");
    setTyping(true);
    
    // Keyboard typing simulation
    let charIdx = 0;
    const interval = setInterval(() => {
      setTypedPrompt((prev) => prev + prompt.charAt(charIdx));
      charIdx++;
      if (charIdx >= prompt.length) {
        clearInterval(interval);
        setTimeout(() => {
          setTyping(false);
          setChatAnswer(answer);
        }, 800);
      }
    }, 30);
  };

  return (
    <section id="analytics" className="relative py-20 md:py-28 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">
            Product Walkthrough
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Explore the LOOP Workspace
          </p>
          <p className="mt-4 text-base text-slate-600">
            Unify scattered customer comments into visual metrics. Select any tab below to inspect the interface (rotates automatically).
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-5xl mx-auto p-1.5 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-secondary to-brand-primary text-white shadow-md shadow-brand-primary/20 scale-[1.02]"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Panel Viewport */}
        <div className="w-full max-w-5xl mx-auto border border-slate-200 bg-white rounded-2xl shadow-md overflow-hidden font-sans select-none">
          
          {/* Header Window Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              app.loop.ai/{activeTab}
            </div>
            <div className="flex items-center gap-2">
              {isPaused ? (
                <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-bold">Auto Rotation Paused</span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" /> Auto Rotating
                </span>
              )}
            </div>
          </div>

          {/* Body Workspace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
            
            {/* Sidebar Navigator */}
            <div className="md:col-span-1 border-r border-slate-200 bg-slate-50/50 p-4 space-y-6">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Sparkles className="h-4.5 w-4.5 text-brand-accent animate-pulse" />
                <span>LOOP Workspace</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className={`px-3 py-2 rounded-lg transition-all font-bold flex items-center gap-2 ${activeTab === 'inbox' ? 'bg-brand-primary/5 text-brand-primary' : 'hover:bg-slate-100'}`}>
                  <Inbox className="h-3.5 w-3.5" /> Inbox Feed
                </div>
                <div className={`px-3 py-2 rounded-lg transition-all font-bold flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-brand-primary/5 text-brand-primary' : 'hover:bg-slate-100'}`}>
                  <BarChart3 className="h-3.5 w-3.5" /> Analysis Core
                </div>
                <div className={`px-3 py-2 rounded-lg transition-all font-bold flex items-center gap-2 ${activeTab === 'themes' ? 'bg-brand-primary/5 text-brand-primary' : 'hover:bg-slate-100'}`}>
                  <Group className="h-3.5 w-3.5" /> Theme Clusters
                </div>
                <div className={`px-3 py-2 rounded-lg transition-all font-bold flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-brand-primary/5 text-brand-primary' : 'hover:bg-slate-100'}`}>
                  <Bell className="h-3.5 w-3.5" /> Trend Spikes
                </div>
                <div className={`px-3 py-2 rounded-lg transition-all font-bold flex items-center gap-2 ${activeTab === 'reports' ? 'bg-brand-primary/5 text-brand-primary' : 'hover:bg-slate-100'}`}>
                  <FileText className="h-3.5 w-3.5" /> VoC Reports
                </div>
              </div>
            </div>

            {/* Main Content Workspace Pane */}
            <div className="md:col-span-3 p-6 bg-white relative overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* 1. Analytics Dashboard View */}
                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-base font-bold text-slate-800">Sentiment Distribution Overview</h4>
                        <p className="text-xs text-slate-500">Breakdown of positive, neutral, and negative comments.</p>
                      </div>
                      <span className="text-[10px] text-slate-400">Aggregated: 1,780 Comments</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { title: "Positive Sentiment", pct: "64%", count: "1,240 items", color: "bg-green-500" },
                        { title: "Neutral Index", pct: "22%", count: "420 items", color: "bg-slate-450" },
                        { title: "Negative Alerts", pct: "14%", count: "270 items", color: "bg-red-500" },
                      ].map((card, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1 shadow-sm">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{card.title}</span>
                          <span className="text-2xl font-black text-slate-800 block">{card.pct}</span>
                          <span className="text-[9px] text-slate-400">{card.count}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress bars representing classified categories */}
                    <div className="space-y-4 pt-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Volume and Sentiment by Category</h5>
                      <div className="space-y-3.5">
                        {[
                          { category: "Checkout and Billing", pct: 72, volume: "420 comments", color: "from-brand-secondary to-brand-primary" },
                          { category: "App Latency & Load Speed", pct: 45, volume: "260 comments", color: "from-red-400 to-brand-primary" },
                          { category: "UI Layout and Styling", pct: 88, volume: "510 comments", color: "from-emerald-400 to-teal-500" },
                        ].map((bar, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-700">{bar.category}</span>
                              <span className="text-slate-500 font-bold text-[10px]">{bar.volume}</span>
                            </div>
                            <div className="w-full bg-slate-200/60 h-2.5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${bar.pct}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${bar.color}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* 2. Smart Inbox View */}
                {activeTab === "inbox" && (
                  <motion.div
                    key="inbox"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-800">Incoming Feedback Feed</h4>
                        <p className="text-xs text-slate-500">Real-time classification tags and customer sentiment indicators.</p>
                      </div>
                      <span className="text-[10px] text-brand-accent bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 font-medium flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Ingestion active
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { text: "The app keeps lagging when exporting invoice lists, took 12 seconds.", source: "Intercom", sentiment: "Negative", label: "Speed Lag", color: "text-red-650 bg-red-50 border-red-100" },
                        { text: "Beautiful drag & drop builder UI! Cuts layout planning in half.", source: "App Store", sentiment: "Positive", label: "UI Love", color: "text-green-600 bg-green-50 border-green-100" },
                        { text: "Stripe payment screen errors on Android Chrome with code 402.", source: "Zendesk", sentiment: "Negative", label: "Billing Bug", color: "text-red-650 bg-red-50 border-red-100" },
                      ].map((item, idx) => (
                        <div key={idx} className="border border-slate-100 bg-slate-50 hover:bg-slate-100/50 p-3.5 rounded-xl space-y-2 transition shadow-sm">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{item.source}</span>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${item.color}`}>
                              {item.sentiment}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 italic">"{item.text}"</p>
                          <div className="flex gap-2 items-center text-[9px]">
                            <span className="bg-brand-primary/5 text-brand-accent px-1.5 py-0.2 rounded border border-brand-primary/10 font-bold">
                              <Tag className="h-2 w-2 inline mr-1" /> {item.label}
                            </span>
                            <span className="text-slate-400">Processed 4 mins ago</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 3. Ask LOOP AI Chat View */}
                {activeTab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 flex flex-col justify-between h-[420px]"
                  >
                    <div className="border-b border-slate-100 pb-3 flex-shrink-0">
                      <h4 className="text-base font-bold text-slate-800">Ask LOOP AI Assistant</h4>
                      <p className="text-xs text-slate-500">Run search prompts against the indexed database of customer comments.</p>
                    </div>

                    {/* Chat Logs Output Pane */}
                    <div className="flex-1 overflow-y-auto space-y-3.5 min-h-[220px] pr-2 scrollbar-thin">
                      {typedPrompt ? (
                        <div className="space-y-3.5">
                          <div className="flex gap-2 items-start justify-end">
                            <div className="bg-slate-100 text-slate-800 text-xs px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[80%] font-medium">
                              {typedPrompt}
                            </div>
                          </div>
                          
                          {/* Simulated typing dot-loader */}
                          {typing && (
                            <div className="flex gap-2 items-start">
                              <div className="p-2.5 bg-brand-primary/5 rounded-2xl rounded-tl-none border border-brand-primary/10">
                                <div className="flex gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                              </div>
                            </div>
                          )}

                          {chatAnswer && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              className="flex gap-2.5 items-start"
                            >
                              <div className="h-7 w-7 rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Sparkles className="h-4 w-4" />
                              </div>
                              <div className="bg-brand-primary/5 text-slate-800 text-xs px-4 py-2.5 rounded-2xl rounded-tl-none border border-brand-primary/10 max-w-[85%] leading-relaxed">
                                {chatAnswer}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-slate-400">
                          <MessageSquare className="h-8 w-8 text-slate-300 animate-pulse" />
                          <p className="text-xs">Click one of the suggestions below to query the database.</p>
                        </div>
                      )}
                    </div>

                    {/* Pre-made suggestions and input box */}
                    <div className="space-y-3 flex-shrink-0">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePromptClick(
                            "Why are checkout users requesting refunds?",
                            "Refund audits show: 52% mention transaction latency (timeouts over 5 seconds). 24% complain about Stripe payment failure codes, and 12% request local currency supports."
                          )}
                          className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200/80 transition"
                        >
                          "Checkout Refund Reasons?"
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromptClick(
                            "Summarize top mobile feedback complaints",
                            "Analyzing 420 reviews: Users complain about Safari navigation bugs (24 occurrences), lack of a dark-mode toggle (18 occurrences), and slow image loading (15 occurrences)."
                          )}
                          className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200/80 transition"
                        >
                          "Summarize mobile feedback"
                        </button>
                      </div>

                      {/* Mock Input field */}
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          placeholder="Type or click query suggestion..."
                          value={typedPrompt}
                          className="w-full text-xs border border-slate-200 bg-slate-50 text-slate-800 rounded-xl pl-4 pr-10 py-3.5 focus:outline-none placeholder-slate-400"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. Theme Clusters View */}
                {activeTab === "themes" && (
                  <motion.div
                    key="themes"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="text-base font-bold text-slate-800">AI-Clustered Problem Themes</h4>
                      <p className="text-xs text-slate-500">Underlying root causes aggregated from repetitive customer complaints.</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: "Invoice download fails on PDF format button click", count: 48, status: "Critical Spiking", source: "Intercom & Hubspot", alert: true },
                        { title: "Users requesting dark theme toggle setting options", count: 32, status: "Feature Request", source: "App Store & Twitter", alert: false },
                        { title: "Android browser latency issues on credit card input", count: 18, status: "Active Bug", source: "Zendesk ticket logs", alert: false },
                      ].map((theme, idx) => (
                        <div
                          key={idx}
                          className={`border p-4 rounded-xl flex items-center justify-between transition shadow-sm ${
                            theme.alert 
                              ? "border-red-205 bg-red-50/50 hover:bg-red-50 border-red-200" 
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                            <div className="flex gap-2 items-center flex-wrap">
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                theme.alert 
                                  ? "bg-red-500/10 text-red-650" 
                                  : "bg-brand-primary/10 text-brand-accent"
                              }`}>
                                {theme.status}
                              </span>
                              <span className="text-[9px] text-slate-500">Linked to {theme.source}</span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-800 truncate">{theme.title}</h5>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-base font-extrabold text-slate-800 block">{theme.count}</span>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500 block">Comments</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 5. Trend Detection View */}
                {activeTab === "alerts" && (
                  <motion.div
                    key="alerts"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-base font-bold text-slate-800">Trend & Volume Anomalies</h4>
                        <p className="text-xs text-slate-500">Sudden feedback spikes mapped across communication channels.</p>
                      </div>
                      <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 animate-pulse" /> 3 Spikes Flagged
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: "Stripe checkout failures on iOS Safari", spike: "180%", delta: "↑ 24 comments/hr", channel: "Zendesk", severity: "Critical" },
                        { title: "Dashboard charts failing to render on Chrome 124", spike: "90%", delta: "↑ 12 comments/hr", channel: "Intercom", severity: "High" },
                        { title: "Missing invoice download PDF files", spike: "60%", delta: "↑ 8 comments/hr", channel: "Slack Community", severity: "Medium" }
                      ].map((spike, idx) => (
                        <div key={idx} className="border border-slate-200 bg-slate-50 p-4 rounded-xl flex items-center justify-between shadow-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className={`px-2 py-0.2 rounded font-bold uppercase ${
                                spike.severity === 'Critical' ? 'bg-red-100 text-red-650' : spike.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                              }`}>{spike.severity}</span>
                              <span className="text-slate-550 text-slate-500">{spike.channel}</span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-850 text-slate-800">{spike.title}</h5>
                          </div>
                          <div className="text-right">
                            <span className="text-red-550 text-red-500 font-extrabold text-base block">{spike.spike} Spike</span>
                            <span className="text-[9px] text-slate-450 block">{spike.delta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 6. Voice of Customer Report View */}
                {activeTab === "reports" && (
                  <motion.div
                    key="reports"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-base font-bold text-slate-800">Weekly VoC Compilation</h4>
                        <p className="text-xs text-slate-500">AI-generated executive summary with quantitative recommendations.</p>
                      </div>
                      <button className="flex items-center gap-1.5 text-xs text-brand-secondary border border-blue-200 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-semibold">
                        <Download className="h-3.5 w-3.5" /> PDF Summary
                      </button>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4 shadow-sm text-xs text-slate-700">
                      <div className="flex justify-between font-bold border-b border-slate-150 pb-2 text-[10px] text-slate-500 uppercase tracking-wider">
                        <span>Report Period: July 3 - July 10</span>
                        <span>Confidence Level: 98%</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 bg-white border border-slate-100 p-2.5 rounded-lg">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Weekly CSAT</span>
                          <span className="text-base font-black text-green-600">89.4% (↑2.4%)</span>
                        </div>
                        <div className="space-y-1 bg-white border border-slate-100 p-2.5 rounded-lg">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Spiking Regressions</span>
                          <span className="text-base font-black text-red-500">1 Critical Spike</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">AI Executive Recommendation:</div>
                        <div className="pl-3 border-l-2 border-brand-primary/30 leading-relaxed text-slate-655 italic space-y-1 text-slate-600">
                          <div>"1. **Stripe payment timeouts** represent 48 comments. Recommend immediately allocating resources to optimize transaction timeout responses."</div>
                          <div>"2. Address Safari latency requests (15 references) to mitigate churn."</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
