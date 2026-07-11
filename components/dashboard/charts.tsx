"use client";

import { motion } from "framer-motion";

export default function Charts() {
  const bars = [
    { category: "Checkout and Billing", pct: 72, volume: "420 comments", color: "from-brand-secondary to-brand-primary" },
    { category: "App Latency & Load Speed", pct: 45, volume: "260 comments", color: "from-red-400 to-brand-primary" },
    { category: "UI Layout and Styling", pct: 88, volume: "510 comments", color: "from-emerald-400 to-teal-500" },
  ];

  return (
    <div className="space-y-4 pt-2">
      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Volume and Sentiment by Category</h5>
      <div className="space-y-3.5">
        {bars.map((bar, idx) => (
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
  );
}
