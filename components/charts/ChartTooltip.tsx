/**
 * ChartTooltip - Customized tooltip with theme support
 *
 * Provides consistent tooltip styling across all charts with:
 * - Theme-aware colors
 * - Custom formatting options
 * - Consistent appearance
 */

"use client";

import React from "react";
import { getChartTheme } from "@/lib/chart-theme";

interface ChartTooltipProps {
  callbacks?: {
    label?: (context: any) => string;
    title?: (context: any) => string;
  };
  className?: string;
}

export default function ChartTooltip({
  callbacks,
  className,
}: ChartTooltipProps) {
  const theme = getChartTheme();

  return {
    enabled: true,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    titleColor: '#ffffff',
    bodyColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    padding: 12,
    cornerRadius: 4,
    displayColors: true,
    ...callbacks,
  };
}

export function useChartTooltip() {
  const theme = getChartTheme();

  return {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    titleColor: '#ffffff',
    bodyColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    padding: 12,
    cornerRadius: 4,
    displayColors: true,
    titleFont: {
      size: 13,
      weight: 'bold',
    },
    bodyFont: {
      size: 12,
    },
    usePointStyle: true,
  };
}
