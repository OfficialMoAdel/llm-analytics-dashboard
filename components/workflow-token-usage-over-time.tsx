"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { createChartTheme, getChartColors } from "@/lib/chart-utils";
import { filterValidDates } from "@/lib/chart-theme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const truncate20 = (s: string) => (s?.length > 20 ? s.slice(0, 20) + "..." : s);

interface WorkflowTokenUsageOverTimeProps {
  data: AnalyticsRow[];
}

export default function WorkflowTokenUsageOverTime({
  data,
}: WorkflowTokenUsageOverTimeProps) {
  const theme = createChartTheme();
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const validData = filterValidDates(data, "timestamp");

    const workflowTotals = validData.reduce((acc, row) => {
      const w = row.workflow_name || "Unknown";
      const t = row.input_tokens + row.completion_tokens;
      acc[w] = (acc[w] || 0) + t;
      return acc;
    }, {} as Record<string, number>);

    const topWorkflows = Object.entries(workflowTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w);

    const daily: Record<string, Record<string, number>> = {};
    validData.forEach((row) => {
      const w = row.workflow_name || "Unknown";
      if (!topWorkflows.includes(w)) return;

      const date = new Date(row.timestamp);
      if (isNaN(date.getTime()) || date.toString() === "Invalid Date") {
        return;
      }

      const d = date.toLocaleDateString();
      daily[w] ||= {};
      const t = row.input_tokens + row.completion_tokens;
      daily[w][d] = (daily[w][d] || 0) + t;
    });

    const allDates = new Set<string>();
    Object.values(daily).forEach((m) => Object.keys(m).forEach((d) => allDates.add(d)));
    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const datasets = topWorkflows.map((w, i) => {
      const color = chartColors[i % chartColors.length];
      const transparentColor = theme.toAlpha(color, 0.05);

      return {
        label: w,
        data: sortedDates.map((d) => daily[w]?.[d] || 0),
        borderColor: color,
        backgroundColor: transparentColor,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      };
    });

    return { labels: sortedDates, datasets };
  }, [data, theme, chartColors]);

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: theme.text,
            font: { size: 12 },
            padding: 15,
            generateLabels: (chart) => {
              const dsets = chart.data.datasets || [];
              return dsets.map((ds: any, i: number) => ({
                text: truncate20(String(ds.label ?? "")),
                fillStyle: ds.borderColor as string,
                strokeStyle: ds.borderColor as string,
                lineWidth: 2,
                hidden: false,
                datasetIndex: i,
                fontColor: theme.text,
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = Number(ctx.parsed?.y || 0);
              const name = truncate20(String(ctx.dataset?.label ?? ""));
              return `${name}: ${v.toLocaleString()} tokens`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: theme.grid,
          },
          ticks: {
            color: theme.text,
            callback: (v) => Number(v).toLocaleString(),
          },
        },
        x: {
          grid: {
            color: theme.grid,
          },
          ticks: {
            color: theme.text,
            autoSkip: true,
            maxRotation: 0,
          },
        },
      },
    }),
    [theme]
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow Token Usage Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Token Usage Trends for Top 3 Workflows
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
