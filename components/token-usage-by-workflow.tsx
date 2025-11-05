"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useIsMobile } from "@/hooks/use-mobile";
import { createChartTheme, getChartColors } from "@/lib/chart-utils";

const truncate20 = (s: string) => (s?.length > 20 ? s.slice(0, 20) + "..." : s);

interface TokenUsageByWorkflowProps {
  data: AnalyticsRow[];
}

export default function TokenUsageByWorkflow({ data }: TokenUsageByWorkflowProps) {
  const isMobile = useIsMobile();
  const theme = createChartTheme();
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const workflowTokens = data.reduce((acc, row) => {
      const workflow = row.workflow_name || "Unknown";
      const tokens = row.input_tokens + row.completion_tokens;
      acc[workflow] = (acc[workflow] || 0) + tokens;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(workflowTokens).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([workflow]) => workflow);
    const vals = sorted.map(([, tokens]) => tokens);

    const palette = labels.map(
      (_, i) => chartColors[i % chartColors.length] || theme.toAlpha(chartColors[0], 0.8)
    );

    return {
      labels,
      datasets: [
        {
          label: "Total Tokens",
          data: vals,
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
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Tokens: ${Number(ctx.parsed.x || 0).toLocaleString()}`,
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
          callback: (v) => Number(v).toLocaleString(),
        },
      },
      y: {
        grid: {
          color: theme.grid,
        },
        ticks: {
          color: theme.text,
          font: { size: isMobile ? 9 : 11 },
          callback: function (this: any, value: any) {
            const label = this.getLabelForValue(Number(value));
            return truncate20(label);
          },
        },
      },
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Token Usage by Workflow</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h=[300px] w-full">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
