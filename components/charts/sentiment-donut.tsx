"use client";

import { useState } from "react";

export default function SentimentDonut() {
  const data = [
    { name: "Positive", value: 64, color: "#10B981" },
    { name: "Neutral", value: 22, color: "#94A3B8" },
    { name: "Negative", value: 14, color: "#EF4444" },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG dimensions
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sentiment Share</h4>
        <p className="text-sm font-bold text-slate-800">Total Distribution Index</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
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
              const percentage = (item.value / total) * 100;
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
            {hoveredIdx !== null ? (
              <>
                <span className="text-2xl font-black text-slate-800">
                  {data[hoveredIdx].value}%
                </span>
                <span className="text-[9px] font-bold text-slate-450 uppercase text-slate-400">
                  {data[hoveredIdx].name}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-slate-800">64%</span>
                <span className="text-[9px] font-bold text-slate-450 uppercase text-slate-400">
                  Positive
                </span>
              </>
            )}
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
