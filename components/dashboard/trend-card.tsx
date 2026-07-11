"use client";

import { Flame } from "lucide-react";

export default function TrendCard() {
  const spikes = [
    { title: "Stripe checkout failures on iOS Safari", spike: "180%", delta: "↑ 24 comments/hr", channel: "Zendesk", severity: "Critical" },
    { title: "Dashboard charts failing to render on Chrome 124", spike: "90%", delta: "↑ 12 comments/hr", channel: "Intercom", severity: "High" },
    { title: "Missing invoice download PDF files", spike: "60%", delta: "↑ 8 comments/hr", channel: "Slack Community", severity: "Medium" }
  ];

  return (
    <div className="space-y-5">
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
        {spikes.map((spike, idx) => (
          <div key={idx} className="border border-slate-200 bg-slate-50 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px]">
                <span className={`px-2 py-0.2 rounded font-bold uppercase ${
                  spike.severity === 'Critical' ? 'bg-red-100 text-red-600' : spike.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                }`}>{spike.severity}</span>
                <span className="text-slate-500">{spike.channel}</span>
              </div>
              <h5 className="text-xs font-bold text-slate-800">{spike.title}</h5>
            </div>
            <div className="text-right">
              <span className="text-red-500 font-extrabold text-base block">{spike.spike} Spike</span>
              <span className="text-[9px] text-slate-400 block">{spike.delta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
