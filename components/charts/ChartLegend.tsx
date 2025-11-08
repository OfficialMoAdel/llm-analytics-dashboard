/**
 * ChartLegend - Styled legend component
 *
 * Provides consistent legend styling across all charts with:
 * - Theme-aware colors
 * - Custom positioning
 * - Consistent appearance
 */

"use client";

import React from "react";
import { getChartTheme } from "@/lib/chart-theme";

interface ChartLegendProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  display?: boolean;
  align?: 'start' | 'center' | 'end';
  labels?: {
    usePointStyle?: boolean;
    padding?: number;
    font?: {
      size?: number;
    };
  };
  className?: string;
}

export default function ChartLegend({
  position = 'top',
  display = true,
  align = 'center',
  labels = {},
  className,
}: ChartLegendProps) {
  const theme = getChartTheme();

  return {
    display,
    position,
    align,
    labels: {
      usePointStyle: true,
      padding: 15,
      font: {
        size: 12,
      },
      color: theme.text,
      ...labels,
    },
  };
}

export function useChartLegend(position: 'top' | 'bottom' | 'left' | 'right' = 'top') {
  const theme = getChartTheme();

  return {
    display: true,
    position,
    align: 'center' as const,
    labels: {
      usePointStyle: true,
      padding: 15,
      font: {
        size: 12,
      },
      color: theme.text,
    },
  };
}
