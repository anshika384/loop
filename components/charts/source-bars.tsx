"use client";

import { motion } from "framer-motion";

interface SourceData {
  name: string;
  count: number;
  pct: number;
  color: string;
}

interface SourceBarsProps {
  data?: SourceData[];
}

export default function SourceBars({ data = [] }: SourceBarsProps) {
  const sources = data;

  if (sources.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sources & Channels</h4>
          <p className="text-sm font-bold text-slate-800">Volume distribution by channel</p>
        </div>
        <div className="h-[120px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 gap-2">
          <span className="text-2xl">🔌</span>
          <span className="font-extrabold text-slate-700 text-xs">No Channel Sources Tracked</span>
          <span className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
            Source volume distribution will display once integrations receive incoming feedback.
          </span>
        </div>
      </div>
    );
  }

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
