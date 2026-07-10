"use client";

import { motion } from "framer-motion";
import { MessageSquare, AlertTriangle, Star, ShieldAlert, Sparkles, Database } from "lucide-react";
import { Variants } from "framer-motion";

export default function Problem() {
  const channels = [
    { name: "Support Tickets", count: "4,200+", source: "Intercom, Zendesk", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50", border: "border-slate-200" },
    { name: "App Store Reviews", count: "1,500+", source: "iOS & Android", icon: Star, color: "text-amber-500", bg: "bg-amber-50", border: "border-slate-200" },
    { name: "NPS Surveys", count: "800+", source: "Delighted, Typeform", icon: Database, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-slate-200" },
    { name: "Sales Notes", count: "300+", source: "Salesforce, Hubspot", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50", border: "border-slate-200" },
  ];

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const diagramVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } },
  };

  return (
    <section id="features" className="relative py-20 md:py-28 bg-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-3">
            The Feedback Problem
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl leading-tight">
            Customer feedback is scattered everywhere.
          </p>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Your team is drowning in data from support tickets, app reviews, sales notes, and community chats, while missing the critical product insights hidden inside them.
          </p>
        </motion.div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Detail Column */}
          <motion.div 
            className="lg:col-span-5 space-y-6"
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className="flex gap-4 items-start" variants={cardVariants}>
              <div className="rounded-xl border border-red-100 bg-red-50 p-3 flex-shrink-0">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Manual Analysis Doesn't Scale
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Product managers spend hundreds of hours manually tag-reading, resulting in biased data, missed trends, and delayed feature responses.
                </p>
              </div>
            </motion.div>

            <motion.div className="flex gap-4 items-start" variants={cardVariants}>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Disconnected Customer Channels
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Support gets bug logs, sales gets feature requests, and marketing gets social feedback. Nobody has the single source of truth.
                </p>
              </div>
            </motion.div>

            {/* Manual vs LOOP card */}
            <motion.div 
              className="border border-slate-200 bg-slate-50 rounded-xl p-5 space-y-3.5 mt-8 shadow-sm"
              variants={cardVariants}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                The Cost of Guesswork
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Feature request sorting</span>
                  <span className="text-red-600 font-semibold">12 hrs/week</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Critical bug detection delay</span>
                  <span className="text-red-600 font-semibold">3 - 5 Days</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Roadmap prioritization</span>
                  <span className="text-red-600 font-semibold">Based on loudest user</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual Diagram Column */}
          <motion.div 
            className="lg:col-span-7 flex justify-center w-full"
            variants={diagramVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative w-full max-w-[560px] aspect-[4/3] rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between overflow-hidden shadow-sm">
              {/* Radial gradient backing the central orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-48 w-48 rounded-full bg-brand-primary/5 blur-[40px] saturate-100" />

              {/* Top Row representing scattered sources */}
              <div className="grid grid-cols-2 gap-4 z-10 w-full mb-8">
                {channels.slice(0, 2).map((ch, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`bg-white rounded-xl p-3 border ${ch.border} flex items-center gap-3 relative cursor-default shadow-sm border-slate-200`}
                  >
                    <div className={`p-2 rounded-lg ${ch.bg} ${ch.color}`}>
                      <ch.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs font-bold text-slate-800 truncate">{ch.name}</span>
                      <span className="block text-[10px] text-slate-500">{ch.source}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Central Consolidation Engine */}
              <div className="flex flex-col items-center justify-center relative my-auto py-4 z-10">
                {/* Visual connectors pointing to center with SVG animations */}
                <div className="absolute inset-0 -z-10 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <style>{`
                      @keyframes dash {
                        to { stroke-dashoffset: -20; }
                      }
                      .data-line {
                        stroke-dasharray: 4 6;
                        animation: dash 3s linear infinite;
                      }
                      .data-line-reverse {
                        stroke-dasharray: 4 6;
                        animation: dash 3.5s linear infinite reverse;
                      }
                    `}</style>
                    <line x1="20" y1="5" x2="100" y2="50" stroke="#9852ff" strokeWidth="1.5" className="data-line opacity-30" />
                    <line x1="180" y1="5" x2="100" y2="50" stroke="#9852ff" strokeWidth="1.5" className="data-line-reverse opacity-30" />
                    <line x1="20" y1="95" x2="100" y2="50" stroke="#3070f0" strokeWidth="1.5" className="data-line-reverse opacity-30" />
                    <line x1="180" y1="95" x2="100" y2="50" stroke="#3070f0" strokeWidth="1.5" className="data-line opacity-30" />
                  </svg>
                </div>

                {/* Central AI Orb */}
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative flex flex-col items-center justify-center p-6 rounded-full border border-brand-primary/20 bg-brand-primary/5 shadow-sm cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary flex items-center justify-center text-white shadow-md">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-accent mt-2 block select-none">
                    LOOP AI ENGINE
                  </span>
                </motion.div>
              </div>

              {/* Bottom scattered sources */}
              <div className="grid grid-cols-2 gap-4 z-10 w-full mt-8">
                {channels.slice(2, 4).map((ch, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.02, y: 2 }}
                    className={`bg-white rounded-xl p-3 border ${ch.border} flex items-center gap-3 relative cursor-default shadow-sm border-slate-200`}
                  >
                    <div className={`p-2 rounded-lg ${ch.bg} ${ch.color}`}>
                      <ch.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs font-bold text-slate-800 truncate">{ch.name}</span>
                      <span className="block text-[10px] text-slate-500">{ch.source}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
