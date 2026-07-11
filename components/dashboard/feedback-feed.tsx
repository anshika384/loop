"use client";

import { motion } from "framer-motion";
import { RefreshCw, Tag } from "lucide-react";

export default function FeedbackFeed() {
  const items = [
    { text: "The app keeps lagging when exporting invoice lists, took 12 seconds.", source: "Intercom", sentiment: "Negative", label: "Speed Lag", color: "text-red-600 bg-red-50 border-red-100" },
    { text: "Beautiful drag & drop builder UI! Cuts layout planning in half.", source: "App Store", sentiment: "Positive", label: "UI Love", color: "text-green-600 bg-green-50 border-green-100" },
    { text: "Stripe payment screen errors on Android Chrome with code 402.", source: "Zendesk", sentiment: "Negative", label: "Billing Bug", color: "text-red-650 bg-red-50 border-red-100" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">Incoming Feedback Feed</h4>
          <p className="text-xs text-slate-500">Real-time classification tags and customer sentiment indicators.</p>
        </div>
        <span className="text-[10px] text-brand-accent bg-brand-primary/5 px-2 py-0.5 rounded border border-brand-primary/10 font-bold flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" /> Ingestion active
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="border border-slate-100 bg-slate-50 hover:bg-slate-100/50 p-3.5 rounded-xl space-y-2 transition shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{item.source}</span>
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${item.color}`}>
                {item.sentiment}
              </span>
            </div>
            <p className="text-xs text-slate-700 italic">"{item.text}"</p>
            <div className="flex gap-2 items-center text-[9px]">
              <span className="bg-brand-primary/5 text-brand-accent px-1.5 py-0.2 rounded border border-brand-primary/10 font-bold">
                <Tag className="h-2.5 w-2.5 inline mr-1" /> {item.label}
              </span>
              <span className="text-slate-400">Processed 4 mins ago</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
