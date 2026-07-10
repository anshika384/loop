"use client";

import { motion } from "framer-motion";
import { Import, Cpu, Sliders, Group, Bell, BarChart3, ChevronRight } from "lucide-react";
import { Variants } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Feedback Ingestion",
      description: "Connect APIs to ingest support tickets, App Store reviews, surveys, sales notes, and social posts instantly.",
      icon: Import,
      badge: "Sources",
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: "02",
      title: "AI Processing Engine",
      description: "Our proprietary LLM pipelines clean, translate, and perform initial structural analysis on every comment.",
      icon: Cpu,
      badge: "Processing",
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: "03",
      title: "Classification & Tagging",
      description: "Categorize every feedback item by topic (e.g., billing, UI, bug) and extract custom sentiment indicators.",
      icon: Sliders,
      badge: "Classification",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "04",
      title: "Theme Clustering",
      description: "Semantic algorithms automatically cluster matching issues together to highlight root causes.",
      icon: Group,
      badge: "Semantic Grouping",
      color: "from-pink-500 to-brand-primary",
    },
    {
      id: "05",
      title: "Trend Detection",
      description: "Spike alerts and anomaly trackers flag newly emerging user pain points before they impact churn.",
      icon: Bell,
      badge: "Anomaly Detection",
      color: "from-brand-primary to-brand-secondary",
    },
    {
      id: "06",
      title: "Insights Dashboard",
      description: "Explore the ranked feedback, ask questions to the AI, and export Voice of Customer reports in one click.",
      icon: BarChart3,
      badge: "Dashboard Analytics",
      color: "from-brand-secondary to-emerald-500",
    },
  ];

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
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="ai-engine" className="relative py-20 md:py-28 bg-slate-50">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

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
            The Pipeline
          </h2>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            How LOOP Works
          </p>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            A fully automated, real-time feedback processing engine designed to turn raw comments into ranked product priorities.
          </p>
        </motion.div>

        {/* Horizontal & Vertical Flow Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                variants={cardVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-primary/20 hover:shadow-[0_15px_30px_-10px_rgba(152,82,255,0.08)] cursor-default"
              >
                {/* Header Indicator */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-black bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent group-hover:from-brand-secondary group-hover:to-brand-primary transition-all">
                    {step.id}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:text-brand-accent transition-colors">
                    {step.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${step.color} text-white shadow-sm transform group-hover:scale-105 transition-transform duration-350`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Right connector arrow (for desktop layout) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 -translate-y-1/2 hidden lg:flex text-slate-300 z-10 pointer-events-none group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="h-6 w-6" />
                  </div>
                )}
              </motion.div>
            );
          })}

        </motion.div>

        {/* Workflow Diagram Preview banner */}
        <motion.div
          className="mt-16 border border-brand-primary/10 bg-brand-primary/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-brand-accent" />
              Need custom classifications?
            </h4>
            <p className="text-sm text-slate-600">
              Configure custom taxonomy rules to tag feedback specifically to your product module schemas.
            </p>
          </div>
          <button className="rounded-full bg-slate-900 text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition shadow-sm">
            Explore Custom Rules
          </button>
        </motion.div>

      </div>
    </section>
  );
}
