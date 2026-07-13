"use client";

import { useState } from "react";

interface CategoryData {
  name: string;
  volume: number;
  color: string;
}

interface CategoryBarsProps {
  data?: CategoryData[];
}

export default function CategoryBars({ data = [] }: CategoryBarsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Categories Breakdown</h4>
          <p className="text-sm font-bold text-slate-800">Top Problem Areas</p>
        </div>
        <div className="h-[220px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 gap-2">
          <span className="text-2xl">📊</span>
          <span className="font-extrabold text-slate-700 text-xs">No Category Analytics Available</span>
          <span className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
            AI problem categories will be listed once customer complaints are clustered.
          </span>
        </div>
      </div>
    );
  }

  const width = 500;
  const height = 220;
  const padding = 40;

  const maxVal = Math.max(...data.map((d) => d.volume), 10);

  const getX = (index: number) => {
    const chartWidth = width - padding * 2;
    const spacingCount = data.length || 1;
    const barSpacing = chartWidth / spacingCount;
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
