"use client";

import { motion } from "framer-motion";

interface SourceData {
  name: string;
  count: number;
  pct: number;
  color: string;
}

export default function SourceBars() {
  const sources: SourceData[] = [
    { name: "Zendesk Support", count: 480, pct: 27, color: "bg-blue-500" },
    { name: "Intercom Messenger", count: 390, pct: 22, color: "bg-indigo-500" },
    { name: "App Store Reviews", count: 320, pct: 18, color: "bg-emerald-500" },
    { name: "Twitter/X Mentions", count: 300, pct: 17, color: "bg-sky-500" },
    { name: "Hubspot Integration", count: 290, pct: 16, color: "bg-orange-500" },
  ];

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sources & Channels</h4>
        <p className="text-sm font-bold text-slate-800">Volume distribution by channel</p>
      </div>

      <div className="space-y-3.5">
        {sources.map((src, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700">{src.name}</span>
              <span className="text-slate-400 text-[10px]">
                {src.count} items ({src.pct}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${src.pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${src.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
