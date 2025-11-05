"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { createChartTheme, getChartColors } from "@/lib/chart-utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ToolUsageDistributionProps {
  data: AnalyticsRow[];
}

export default function ToolUsageDistribution({ data }: ToolUsageDistributionProps) {
  const isMobile = useIsMobile();
  const theme = createChartTheme();
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const toolTokens = data.reduce(
      (acc, row) => {
        if (row.tool) {
          const tokens = row.input_tokens + row.completion_tokens;
          acc[row.tool] = (acc[row.tool] || 0) + tokens;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(toolTokens).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([tool]) => tool);
    const values = sorted.map(([, tokens]) => tokens);

    const palette = labels.map(
      (_, i) => chartColors[i % chartColors.length] || theme.toAlpha(chartColors[0], 0.8)
    );

    return {
      labels,
      datasets: [
        {
          label: "Tokens",
          data: values,
          backgroundColor: palette,
          borderColor: theme.primary,
          borderWidth: 1,
        },
      ],
    };
  }, [data, theme, chartColors]);

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.grid,
        titleColor: theme.text,
        bodyColor: theme.text,
        callbacks: {
          label: (context) => {
            return `Tokens: ${(context.parsed.x ?? 0).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
          font: { size: isMobile ? 9 : 11 },
          callback: (value) => Number(value).toLocaleString(),
        },
      },
      y: {
        grid: {
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
          font: { size: isMobile ? 9 : 11 },
        },
      },
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Tool Usage Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
