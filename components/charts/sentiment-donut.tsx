"use client";

import { useState } from "react";

interface SentimentDonutProps {
  data?: { name: string; value: number; color: string }[];
}

export default function SentimentDonut({ data = [] }: SentimentDonutProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (total === 0) {
    return (
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sentiment Share</h4>
          <p className="text-sm font-bold text-slate-800">Total Distribution Index</p>
        </div>
        <div className="h-[200px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 gap-2 my-2">
          <span className="text-2xl">🍩</span>
          <span className="font-extrabold text-slate-700 text-xs">No Sentiment Share Available</span>
          <span className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
            Sentiment breakdowns will appear here once customer feedbacks are processed.
          </span>
        </div>
      </div>
    );
  }

  // SVG dimensions
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  const defaultItem = data.find((d) => d.name === "Positive") || data[0] || { name: "No Data", value: 0 };
  const displayItem = hoveredIdx !== null ? data[hoveredIdx] : defaultItem;

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sentiment Share</h4>
        <p className="text-sm font-bold text-slate-800">Total Distribution Index</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-full max-w-[160px] aspect-square shrink-0 mx-auto sm:mx-0">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90 overflow-visible">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {data.map((item, idx) => {
              const strokeLength = (item.value / total) * circumference;
              const strokeOffset = circumference - strokeLength + currentOffset;
              currentOffset -= strokeLength;
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Central label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl sm:text-2xl font-black text-slate-800">
              {displayItem.value}%
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-450 uppercase text-slate-400">
              {displayItem.name}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 text-xs">
          {data.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-transparent transition-all duration-200 ${
                hoveredIdx === idx ? "bg-slate-50 border-slate-200" : ""
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0">
                <p className="font-extrabold text-slate-700 leading-none">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.value}% Share</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
