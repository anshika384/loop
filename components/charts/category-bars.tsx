"use client";

import { useState } from "react";

interface CategoryData {
  name: string;
  volume: number;
  color: string;
}

export default function CategoryBars() {
  const data: CategoryData[] = [
    { name: "Checkout & Stripe", volume: 42, color: "url(#barBilling)" },
    { name: "App Latency", volume: 26, color: "url(#barLatency)" },
    { name: "UI Design", volume: 51, color: "url(#barUI)" },
    { name: "Feature Requests", volume: 18, color: "url(#barFeatures)" },
  ];

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 500;
  const height = 220;
  const padding = 40;

  const maxVal = Math.max(...data.map((d) => d.volume), 60);

  const getX = (index: number) => {
    const chartWidth = width - padding * 2;
    const barSpacing = chartWidth / data.length;
    return padding + index * barSpacing + barSpacing / 2;
  };

  const getY = (value: number) => {
    const chartHeight = height - padding * 2;
    return height - padding - (value * chartHeight) / maxVal;
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
      <div>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Categories Breakdown</h4>
        <p className="text-sm font-bold text-slate-800">Top Problem Areas</p>
      </div>

      <div className="relative w-full aspect-[500/220] min-h-[180px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="barBilling" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="barLatency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="barUI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="barFeatures" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const chartHeight = height - padding * 2;
            const y = padding + ratio * chartHeight;
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const x = getX(i);
            const y = getY(d.volume);
            const barWidth = 40;
            const barHeight = height - padding - y;
            const isHovered = hoveredIdx === i;

            return (
              <g key={i}>
                {/* Rounded Bar */}
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 4)}
                  rx="6"
                  ry="6"
                  fill={d.color}
                  className="transition-all duration-300 cursor-pointer"
                  opacity={hoveredIdx !== null && !isHovered ? 0.6 : 1}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* X Axis Labels */}
                <text
                  x={x}
                  y={height - 15}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-slate-400"
                >
                  {d.name.length > 12 ? d.name.slice(0, 10) + ".." : d.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl pointer-events-none border border-slate-800 z-10 flex flex-col w-32 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${(getX(hoveredIdx) / width) * 100}%`,
              transform: "translate(-50%, -100%)",
              top: `${(getY(data[hoveredIdx].volume) / height) * 100 - 10}%`,
            }}
          >
            <span className="font-extrabold text-slate-450 text-slate-400 border-b border-slate-800 pb-1 mb-1 truncate">
              {data[hoveredIdx].name}
            </span>
            <span className="font-black text-xs text-white">
              {data[hoveredIdx].volume} Comments
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
