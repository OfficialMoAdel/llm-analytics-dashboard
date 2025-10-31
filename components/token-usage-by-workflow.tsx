"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChartColors, truncate20 } from "@/hooks/use-chart-colors";

interface TokenUsageByWorkflowProps {
  data: AnalyticsRow[];
}

export default function TokenUsageByWorkflow({ data }: TokenUsageByWorkflowProps) {
  const isMobile = useIsMobile();
  const colors = useChartColors();

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
      (_, i) => colors.series[i % Math.max(colors.series.length, 1)]
    );

    return {
      labels,
      datasets: [
        {
          label: "Total Tokens",
          data: vals,
          backgroundColor: palette,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ],
    };
  }, [data, colors]);

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
    grid: { color: colors.axis },     // كان colors.grid
    ticks: {
      color: colors.grid,             // كان colors.axis
      font: { size: isMobile ? 9 : 11 },
      callback: (v) => Number(v).toLocaleString(),
    },
  },
  y: {
    grid: { color: colors.axis },     // كان colors.grid
    ticks: {
      color: colors.grid,             // كان colors.axis
      font: { size: isMobile ? 9 : 11 },
      callback: function (this: any, value: any) {
        const label = this.getLabelForValue(Number(value));
        return label.length > 18 ? label.slice(0, 18) + "..." : label;
      },
    },
  },
}
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
