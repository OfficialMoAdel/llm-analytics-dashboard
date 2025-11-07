/**
 * RechartsLegend - Interactive legend component for Recharts
 *
 * Features:
 * - Position at bottom, right, or top
 * - Click to hide/show data series
 * - Visual feedback for hidden items
 * - Consistent styling across charts
 */

"use client";

import React from "react";

interface RechartsLegendProps {
  position?: "bottom" | "right" | "top";
  onItemClick?: (dataKey: string, name: string) => void;
  hiddenItems?: Set<string>;
  payload?: Array<{
    id?: string;
    dataKey?: string;
    value: string;
    color: string;
    type?: string;
  }>;
}

export default function RechartsLegend({
  position = "bottom",
  onItemClick,
  hiddenItems,
  payload,
}: RechartsLegendProps) {
  if (!payload || payload.length === 0) {
    return null;
  }

  const renderItem = (entry: any, index: number) => {
    const dataKey = entry.id || entry.dataKey || entry.value;
    const isHidden = hiddenItems?.has(dataKey);

    return (
      <div
        key={`legend-${index}`}
        className={`flex items-center gap-2 ${
          onItemClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
        }`}
        onClick={() => {
          if (onItemClick) {
            onItemClick(dataKey, entry.value);
          }
        }}
        style={{ opacity: isHidden ? 0.4 : 1 }}
      >
        <div
          className="w-3 h-3 rounded flex-shrink-0"
          style={{
            backgroundColor: entry.color,
            opacity: isHidden ? 0.4 : 1,
          }}
        />
        <span
          className="text-xs"
          style={{ color: isHidden ? "#999" : "inherit" }}
        >
          {entry.value}
        </span>
      </div>
    );
  };

  if (position === "right") {
    return (
      <div className="flex flex-col gap-1 pl-4">
        {payload.map((entry, index) => renderItem(entry, index))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {payload.map((entry, index) => renderItem(entry, index))}
    </div>
  );
}
