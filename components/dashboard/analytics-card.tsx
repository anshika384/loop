"use client";

import { motion } from "framer-motion";

interface SentimentCardProps {
  title: string;
  pct: string;
  count: string;
  color: string;
}

export default function AnalyticsCard() {
  const cards: SentimentCardProps[] = [
    { title: "Positive Sentiment", pct: "64%", count: "1,240 items", color: "bg-green-500" },
    { title: "Neutral Index", pct: "22%", count: "420 items", color: "bg-slate-400" },
    { title: "Negative Alerts", pct: "14%", count: "270 items", color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <div>
          <h4 className="text-base font-bold text-slate-800">Sentiment Distribution Overview</h4>
          <p className="text-xs text-slate-500">Breakdown of positive, neutral, and negative comments.</p>
        </div>
        <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Aggregated: 1,780 Comments
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${card.color}`} />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                {card.title}
              </span>
            </div>
            <span className="text-2xl font-black text-slate-800 block">{card.pct}</span>
            <span className="text-[9px] text-slate-400 font-medium">{card.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
