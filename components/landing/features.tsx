"use client";

import { motion, Variants } from "framer-motion";
import { Sliders, Group, Bell, MessageSquare, FileText, Search, Tag, Sparkles } from "lucide-react";

export default function Features() {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section id="features-grid" className="relative py-20 md:py-28 bg-white overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">
            Core Features
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            AI-Powered Customer Intelligence
          </p>
          <p className="mt-4 text-base text-slate-655 sm:text-lg">
            A comprehensive suite of intelligence tools designed to help product and support teams analyze customer comments at scale.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          
          {/* Card 1: AI Classification (Double Width - 2 Cols) */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="lg:col-span-2 group relative flex flex-col justify-between rounded-2xl border bg-blue-50/70 border-blue-200 hover:border-blue-300 hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.12)] p-6 shadow-sm transition-all duration-300 cursor-default"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start h-full">
              <div className="md:col-span-3 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shadow-sm">
                      <Sliders className="h-6 w-6" />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-slate-100/80 text-slate-500 group-hover:text-brand-accent transition-colors">
                      Categorize
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-accent transition-colors">
                    AI Classification
                  </h3>
                  <p className="text-sm text-slate-655 leading-relaxed text-slate-605 text-slate-600">
                    Automatically label customer comments with custom categories like billing, UI, bugs, and speed with 98% accuracy.
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">98.4% Average precision across datasets</div>
              </div>
              
              <div className="md:col-span-2 flex items-center justify-center h-full pt-4 md:pt-0">
                <div className="w-full border border-slate-100 bg-white rounded-xl p-3.5 space-y-2.5 shadow-sm">
                  <div className="text-[10px] text-slate-600 italic">"The payment screen fails to load on Android..."</div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="flex items-center gap-1 text-[8px] bg-red-500/10 text-red-650 px-1.5 py-0.5 rounded border border-red-200 font-bold">
                      <Tag className="h-2 w-2" /> Bug
                    </span>
                    <span className="flex items-center gap-1 text-[8px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-200 font-bold">
                      <Tag className="h-2 w-2" /> Billing
                    </span>
                    <span className="text-[8px] text-slate-405 ml-auto font-medium">Auto-Tagged</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Theme Clustering (Single Width - 1 Col) */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="lg:col-span-1 group relative flex flex-col justify-between rounded-2xl border bg-purple-50/70 border-purple-200 hover:border-purple-300 hover:shadow-[0_15px_30px_-10px_rgba(168,85,247,0.12)] p-6 shadow-sm transition-all duration-300 cursor-default"
          >
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 shadow-sm">
                  <Group className="h-6 w-6" />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-slate-100/80 text-slate-500 group-hover:text-brand-accent transition-colors">
                  Cluster
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-accent transition-colors">
                Theme Clustering
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Group hundreds of duplicate comments across channels into unified, actionable problem clusters without manual work.
              </p>
            </div>

            <div className="border border-slate-100 bg-white rounded-xl p-3.5 space-y-2 text-[10px] shadow-sm">
              <div className="flex justify-between items-center font-bold text-slate-705 text-slate-700">
                <span>Theme: Invoice Download Bug</span>
                <span className="text-brand-accent bg-brand-primary/10 px-1.5 py-0.5 rounded text-[8px] font-bold">24 Items</span>
              </div>
              <div className="space-y-1 pl-1.5 border-l border-brand-primary/20 text-[9px] text-slate-500">
                <div>• Intercom ticket #4312 (1 hr ago)</div>
                <div>• Zendesk ticket #9021 (4 hrs ago)</div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Trend Detection (Single Width - 1 Col) */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="lg:col-span-1 group relative flex flex-col justify-between rounded-2xl border bg-amber-50/70 border-amber-200 hover:border-amber-300 hover:shadow-[0_15px_30px_-10px_rgba(245,158,11,0.12)] p-6 shadow-sm transition-all duration-300 cursor-default"
          >
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm">
                  <Bell className="h-6 w-6" />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-slate-100/80 text-slate-505 text-slate-500 group-hover:text-brand-accent transition-colors">
                  Alerts
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-accent transition-colors">
                Trend Detection
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Track volumes and trigger immediate alerts when specific customer feedback themes spike anomalously.
              </p>
            </div>

            <div className="border border-slate-100 bg-white rounded-xl p-3.5 space-y-2 text-[10px] shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-650 font-semibold">
                <Bell className="h-3.5 w-3.5 animate-bounce text-amber-500" />
                <span>Volume Anomaly Detected</span>
              </div>
              <div className="text-[9px] text-slate-500">
                Theme <span className="text-slate-800 font-medium">"OAuth Login Fails"</span> spiked <span className="text-red-500 font-bold">140%</span>.
              </div>
            </div>
          </motion.div>

          {/* Card 4: Ask LOOP (Double Width - 2 Cols) */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="lg:col-span-2 group relative flex flex-col justify-between rounded-2xl border bg-emerald-50/70 border-emerald-200 hover:border-emerald-300 hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.12)] p-6 shadow-sm transition-all duration-300 cursor-default"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start h-full">
              <div className="md:col-span-3 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-slate-100/80 text-slate-500 group-hover:text-brand-accent transition-colors">
                      AI Assistant
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-accent transition-colors">
                    Ask LOOP (AI Chat)
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Query your customer feedback database in natural language and get immediate, evidence-backed answers.
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Instant context mapping over millions of words</div>
              </div>
              
              <div className="md:col-span-2 flex items-center justify-center h-full pt-4 md:pt-0">
                <div className="w-full border border-slate-100 bg-white rounded-xl p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex gap-1.5 items-start text-[9px]">
                    <span className="font-semibold text-brand-secondary">User:</span>
                    <span className="text-slate-600">"Why do users request refunds?"</span>
                  </div>
                  <div className="flex gap-1.5 items-start bg-brand-primary/5 rounded p-2 border border-brand-primary/10 text-[9px] text-brand-accent">
                    <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0 animate-pulse" />
                    <span>"48% mention checkout latency. 12% mention missing currencies."</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Voice of Customer Reports (Single Width - 1 Col) */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="lg:col-span-1 group relative flex flex-col justify-between rounded-2xl border bg-pink-50/70 border-pink-200 hover:border-pink-300 hover:shadow-[0_15px_30px_-10px_rgba(236,72,153,0.12)] p-6 shadow-sm transition-all duration-300 cursor-default"
          >
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-500 shadow-sm">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-slate-100/80 text-slate-500 group-hover:text-brand-accent transition-colors">
                  Reporting
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-accent transition-colors">
                Voice of Customer Reports
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Auto-compile executive weekly summaries highlighting sentiment shifts, top themes, and proposed roadmap updates.
              </p>
            </div>

            <div className="border border-slate-100 bg-white rounded-xl p-3.5 space-y-2 text-[10px] shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-150 pb-1 font-bold text-slate-705 text-slate-700">
                <span>Weekly Executive Summary</span>
                <span className="text-[8px] text-slate-400">July 10</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[8px]">
                <div className="bg-white border border-slate-200/60 p-1 rounded shadow-inner">
                  <span className="block text-slate-400 uppercase tracking-widest text-[6px]">CSAT</span>
                  <span className="font-bold text-green-600">89.4% (↑1.2%)</span>
                </div>
                <div className="bg-white border border-slate-200/60 p-1 rounded shadow-inner">
                  <span className="block text-slate-400 uppercase tracking-widest text-[6px]">Main issue</span>
                  <span className="font-bold text-slate-850 text-slate-800 truncate block">Safari Lag</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 6: Semantic Search (Double Width - 2 Cols) */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="lg:col-span-2 group relative flex flex-col justify-between rounded-2xl border bg-sky-50/70 border-sky-200 hover:border-sky-300 hover:shadow-[0_15px_30px_-10px_rgba(14,165,233,0.12)] p-6 shadow-sm transition-all duration-300 cursor-default"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start h-full">
              <div className="md:col-span-3 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="p-3 rounded-xl bg-sky-500/10 text-sky-505 text-sky-500 shadow-sm">
                      <Search className="h-6 w-6" />
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-slate-100/80 text-slate-500 group-hover:text-brand-accent transition-colors">
                      Search
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-accent transition-colors">
                    Semantic Search
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Search feedback by intent rather than exact keywords. Search for 'speed' to instantly find 'slow', 'latency', and 'lag'.
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Understands intent mappings across 40+ human languages</div>
              </div>
              
              <div className="md:col-span-2 flex items-center justify-center h-full pt-4 md:pt-0">
                <div className="w-full border border-slate-100 bg-white rounded-xl p-3.5 space-y-2 shadow-sm">
                  <div className="flex items-center gap-1.5 bg-white rounded px-2.5 py-1.5 border border-slate-200 text-slate-400 text-[9px]">
                    <Search className="h-3 w-3 text-slate-450" /> Search: "slow loading"
                  </div>
                  <div className="text-[8px] bg-brand-primary/5 p-2 rounded border border-brand-primary/10 flex justify-between text-slate-700 leading-relaxed">
                    <span>"...checkout screen takes 6s to **load**"</span>
                    <span className="text-brand-accent font-semibold ml-2">97% match</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
