import React from "react";
import { safeToLocaleString } from "@/lib/utils";

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface LineChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
}

export function SimpleLineChart({
  data,
  title,
  height = 300,
  color = "#2563eb",
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const padding = 40;
  const chartWidth = 600;
  const chartHeight = height - 80;

  const points = data
    .map((point, index) => {
      const x =
        padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
      const y =
        padding +
        ((maxValue - point.value) * (chartHeight - 2 * padding)) / valueRange;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="border rounded"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const value = minValue + (valueRange * percent) / 100;
            const y =
              padding + ((100 - percent) * (chartHeight - 2 * padding)) / 100;
            return (
              <g key={percent}>
                <text
                  x={padding - 10}
                  y={y + 5}
                  fontSize="12"
                  fill="#64748b"
                  textAnchor="end"
                >
                  {safeToLocaleString(value)}
                </text>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, index) => {
            const x =
              padding +
              (index * (chartWidth - 2 * padding)) / (data.length - 1);
            return (
              <text
                key={index}
                x={x}
                y={height - 20}
                fontSize="12"
                fill="#64748b"
                textAnchor="middle"
              >
                {point.name}
              </text>
            );
          })}

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={points}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x =
              padding +
              (index * (chartWidth - 2 * padding)) / (data.length - 1);
            const y =
              padding +
              ((maxValue - point.value) * (chartHeight - 2 * padding)) /
                valueRange;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function SimpleBarChart({
  data,
  title,
  height = 300,
  color = "#2563eb",
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const padding = 40;
  const chartWidth = 600;
  const chartHeight = height - 80;
  const barWidth = ((chartWidth - 2 * padding) / data.length) * 0.8;
  const barSpacing = ((chartWidth - 2 * padding) / data.length) * 0.2;

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="border rounded"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="bargrid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bargrid)" />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((percent) => {
            const value = (maxValue * percent) / 100;
            const y =
              padding + ((100 - percent) * (chartHeight - 2 * padding)) / 100;
            return (
              <g key={percent}>
                <text
                  x={padding - 10}
                  y={y + 5}
                  fontSize="12"
                  fill="#64748b"
                  textAnchor="end"
                >
                  {safeToLocaleString(value)}
                </text>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Bars */}
          {data.map((point, index) => {
            const x =
              padding +
              (index * (chartWidth - 2 * padding)) / data.length +
              barSpacing / 2;
            const barHeight =
              (point.value * (chartHeight - 2 * padding)) / maxValue;
            const y = chartHeight + padding - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={point.color || color}
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 20}
                  fontSize="12"
                  fill="#64748b"
                  textAnchor="middle"
                >
                  {point.name}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="11"
                  fill="#374151"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {safeToLocaleString(point.value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
