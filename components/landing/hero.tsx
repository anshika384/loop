"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MessageSquare, TrendingUp, Star, Shield, Frown, ThumbsUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Variants } from "framer-motion";

export default function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden pt-4 pb-24 md:pt-6 md:pb-36 lg:pt-8 bg-gradient-to-b from-blue-100/50 via-blue-50/30 to-white">
      {/* Background Glowing Gradients (Softened for Light Mode) */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/[0.04] blur-[120px] saturate-100 animate-glow" />
      <div className="absolute top-1/3 left-1/4 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-brand-secondary/[0.05] blur-[100px] saturate-100" />
      
      {/* Very subtle Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 -z-25" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Announcement Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 self-center lg:self-start rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1.5 text-xs font-semibold text-brand-accent mb-6 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-accent animate-pulse" />
              <span>Unify Customer Feedback Streams</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-[1.1] mb-6"
            >
              Turn Customer Feedback <br />
              <span className="bg-gradient-to-r from-brand-secondary via-brand-accent to-brand-primary bg-clip-text text-transparent">
                Into Product Decisions.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={itemVariants}
              className="text-base text-slate-600 sm:text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8"
            >
              LOOP uses Artificial Intelligence to analyze customer feedback from support tickets, surveys, app reviews, sales calls, and community discussions to uncover trends, themes, and actionable insights.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="#get-started"
                className="relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-8 py-4 text-base font-bold text-slate-700 transition-all duration-250 hover:scale-[1.02] active:scale-[0.98]"
              >
                Book Demo
              </Link>
            </motion.div>

            {/* Social Trust Metrics */}
            <motion.div 
              variants={itemVariants}
              className="mt-10 pt-8 border-t border-slate-200 flex flex-wrap gap-6 justify-center lg:justify-start items-center text-slate-500"
            >
              <div className="flex items-center gap-1.5 hover:text-slate-800 transition-colors duration-250">
                <Shield className="h-5 w-5 text-brand-accent" />
                <span className="text-xs font-bold uppercase tracking-wider">Enterprise Security Ready</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-accent text-brand-accent" />
                ))}
                <span className="text-xs font-bold uppercase tracking-wider ml-1.5">G2 Rating 4.9/5</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Showcase Column (Floating Mockups with Depth) */}
          <div className="lg:col-span-7 z-10 w-full relative h-[440px] md:h-[500px] flex items-center justify-center">
            
            {/* 1. Main Background Workspace Pane (Light SaaS Mode) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="relative w-[85%] md:w-[90%] left-[-5%] glass-panel rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200 overflow-hidden font-sans select-none"
            >
              {/* Header Window Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                </div>
                <div className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  app.loop.ai/inbox
                </div>
                <div className="w-8" />
              </div>

              {/* Internal layout */}
              <div className="p-4 bg-white min-h-[280px] space-y-3.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-500">LOOP AI Processing Feed</span>
                  <span className="text-[9px] text-brand-accent bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 font-medium">Active Ingestion</span>
                </div>
                
                {/* Simulated list items */}
                <div className="space-y-2.5">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[10px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium italic">"Payment keeps failing on Stripe checkouts..."</span>
                      <span className="text-red-600 font-semibold bg-red-500/10 px-1.5 py-0.2 rounded border border-red-200">Negative</span>
                    </div>
                    <div className="flex gap-1.5 text-[8px]">
                      <span className="bg-red-500/5 text-red-600 border border-red-500/10 px-1 py-0.1 rounded font-bold">Stripe Failures</span>
                      <span className="bg-slate-200 text-slate-500 px-1 py-0.1 rounded">Zendesk</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[10px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium italic">"The drag and drop editor is amazing, save tons of time..."</span>
                      <span className="text-green-600 font-semibold bg-green-500/10 px-1.5 py-0.2 rounded border border-green-200">Positive</span>
                    </div>
                    <div className="flex gap-1.5 text-[8px]">
                      <span className="bg-green-500/5 text-green-600 border border-green-500/10 px-1 py-0.1 rounded font-bold">UI Love</span>
                      <span className="bg-slate-200 text-slate-500 px-1 py-0.1 rounded">App Store</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* OVERLAY FLOATING CARDS (Depth & Parallax feel) */}
            
            {/* Card 1: CSAT / Sentiment Doughnut (Top Left) */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ originX: 0.5, originY: 0.5 }}
              className="hidden sm:block"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute top-[30px] left-[5%] md:left-[10px] z-20 glass-panel rounded-xl p-3.5 shadow-lg border border-slate-200/80 max-w-[150px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-600">CSAT Score</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-slate-800">89.4%</span>
                  <span className="text-[9px] text-green-500 font-semibold">↑ 2.4%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-secondary to-brand-primary h-full w-[89%]" />
                </div>
              </motion.div>
            </motion.div>

            {/* Card 2: AI Sparkle Alert (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="hidden sm:block"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute bottom-[40px] right-[5%] md:right-[20px] z-20 glass-panel rounded-xl p-3.5 shadow-lg border border-red-200 max-w-[180px]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-500">Anomaly Alert</span>
                </div>
                <h4 className="text-[11px] font-bold text-slate-800 mb-1">Stripe Checkout Spike</h4>
                <p className="text-[9px] text-slate-600 leading-snug">
                  Failures increased by <span className="text-red-500 font-bold">180%</span> on iOS Safari.
                </p>
              </motion.div>
            </motion.div>

            {/* Card 3: AI Assistant Chat Prompt (Top Right Offset) */}
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="hidden sm:block"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-[10px] right-[10%] md:right-[40px] z-20 glass-panel rounded-xl p-3.5 shadow-lg border border-slate-200/80 max-w-[190px]"
              >
                <div className="flex items-center gap-1.5 mb-2 border-b border-slate-100 pb-1">
                  <Sparkles className="h-3.5 w-3.5 text-brand-accent animate-pulse" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Ask LOOP AI</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[8px] text-slate-500 leading-tight">
                    <span className="text-brand-secondary font-bold">Q:</span> "Why do users request refunds?"
                  </div>
                  <div className="text-[8px] bg-brand-primary/5 border border-brand-primary/10 rounded p-1.5 text-brand-accent leading-normal">
                    <span className="font-bold">AI:</span> "45% complain about Stripe payment timeout bugs."
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
