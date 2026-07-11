"use client";

import { useState } from "react";

interface TimelineData {
  day: string;
  positive: number;
  negative: number;
}

export default function SentimentTimeline() {
  const data: TimelineData[] = [
    { day: "Mon", positive: 5, negative: 3 },
    { day: "Tue", positive: 8, negative: 2 },
    { day: "Wed", positive: 12, negative: 5 },
    { day: "Thu", positive: 9, negative: 6 },
    { day: "Fri", positive: 15, negative: 4 },
    { day: "Sat", positive: 18, negative: 2 },
    { day: "Sun", positive: 14, negative: 3 },
  ];

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG dimensions
  const width = 600;
  const height = 220;
  const padding = 30;

  // Max value for scaling
  const maxVal = Math.max(...data.flatMap((d) => [d.positive, d.negative]), 20);

  const getX = (index: number) => {
    return padding + (index * (width - padding * 2)) / (data.length - 1);
  };

  const getY = (value: number) => {
    return height - padding - (value * (height - padding * 2)) / maxVal;
  };

  // Generate SVG path for a line
  const generatePath = (key: "positive" | "negative") => {
    return data
      .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d[key])}`)
      .join(" ");
  };

  // Generate SVG path for the area under the line (for gradient fill)
  const generateAreaPath = (key: "positive" | "negative") => {
    const linePath = generatePath(key);
    const firstX = getX(0);
    const lastX = getX(data.length - 1);
    const baseY = height - padding;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sentiment Over Time</h4>
          <p className="text-sm font-bold text-slate-800">Weekly Timeline Distribution</p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>Positive</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>Negative</span>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[600/220] min-h-[180px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding + ratio * (height - padding * 2);
            return (
              <line
                key={i}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* X Axis labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 10}
              textAnchor="middle"
              className="text-[9px] font-bold fill-slate-400"
            >
              {d.day}
            </text>
          ))}

          {/* Area Gradients */}
          <path d={generateAreaPath("positive")} fill="url(#posGrad)" />
          <path d={generateAreaPath("negative")} fill="url(#negGrad)" />

          {/* Lines */}
          <path
            d={generatePath("positive")}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={generatePath("negative")}
            fill="none"
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Mouse Guides */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIdx === i;
            return (
              <g key={i}>
                {/* Invisible hover trigger column */}
                <rect
                  x={x - 20}
                  y={0}
                  width={40}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {isHovered && (
                  <>
                    {/* Vertical guide line */}
                    <line
                      x1={x}
                      y1={padding}
                      x2={x}
                      y2={height - padding}
                      stroke="#94A3B8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />

                    {/* Positive point */}
                    <circle
                      cx={x}
                      cy={getY(d.positive)}
                      r="5"
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />

                    {/* Negative point */}
                    <circle
                      cx={x}
                      cy={getY(d.negative)}
                      r="5"
                      fill="#EF4444"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl pointer-events-none border border-slate-800 z-10 flex flex-col gap-1 w-24 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: `${(getX(hoveredIdx) / width) * 100}%`,
              transform: "translate(-50%, -100%)",
              top: `${(getY(data[hoveredIdx].positive) / height) * 100 - 10}%`,
            }}
          >
            <div className="font-extrabold text-slate-400 border-b border-slate-800 pb-1 mb-1">
              {data[hoveredIdx].day}
            </div>
            <div className="flex justify-between font-bold text-green-400">
              <span>Pos:</span>
              <span>{data[hoveredIdx].positive}</span>
            </div>
            <div className="flex justify-between font-bold text-red-400">
              <span>Neg:</span>
              <span>{data[hoveredIdx].negative}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
