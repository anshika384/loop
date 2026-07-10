"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section id="get-started" className="relative py-20 md:py-28 bg-white overflow-hidden">
      {/* Glow backgrounds (Softened for light theme) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-72 w-72 rounded-full bg-brand-primary/5 blur-[90px] animate-pulse-slow" />
      <div className="absolute top-1/3 left-1/3 -z-10 h-48 w-48 rounded-full bg-brand-secondary/5 blur-[80px]" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Glow panel frame */}
        <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 md:p-14 text-center shadow-sm">
          {/* Subtle floating dot pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1.5 text-xs font-semibold text-brand-accent mb-6 backdrop-blur-sm relative z-10">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unify Your Feedback Streams Today</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-905 sm:text-4xl md:text-5xl leading-tight mb-4 relative z-10 max-w-3xl mx-auto text-slate-900">
            Stop Guessing What Customers Want. <br />
            <span className="bg-gradient-to-r from-brand-secondary to-brand-primary bg-clip-text text-transparent">
              Start Building What They Actually Ask For.
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-10 relative z-10">
            Join modern product, support, and success teams using LOOP AI to translate scattered raw comments into objective, ranked features.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link
              href="#get-started"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/45 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-8 py-4 text-base font-bold text-slate-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Book Demo
            </Link>
          </div>

          {/* Footnotes */}
          <div className="mt-8 text-xs text-slate-400 relative z-10">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>

      </div>
    </section>
  );
}
