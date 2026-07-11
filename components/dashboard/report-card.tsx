"use client";

import { Download } from "lucide-react";

export default function ReportCard() {
  return (
    <div className="space-y-5">
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
        <div className="flex justify-between font-bold border-b border-slate-200/60 pb-2 text-[10px] text-slate-500 uppercase tracking-wider">
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
          <div className="pl-3 border-l-2 border-brand-primary/30 leading-relaxed text-slate-600 italic space-y-1">
            <div>"1. **Stripe payment timeouts** represent 48 comments. Recommend immediately allocating resources to optimize transaction timeout responses."</div>
            <div>"2. Address Safari latency requests (15 references) to mitigate churn."</div>
          </div>
        </div>
      </div>
    </div>
  );
}
