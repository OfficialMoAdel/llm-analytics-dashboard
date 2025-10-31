"use client";

import React, { useMemo, useEffect, useState } from "react";
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
import { useTheme } from "next-themes";

// Register Chart.js pieces (safe to call once)
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

// ------- Helpers (ألوان + قص) -------
const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const toAlpha = (color: string, a = 0.18) => {
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.fillStyle = color; // hex/rgb/hsl
  const rgb = ctx.fillStyle as string;
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return m ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})` : color;
};

const truncate20 = (s: string) => (s?.length > 20 ? s.slice(0, 20) + "..." : s);

function useChartVars() {
  const { theme } = useTheme();
  const [v, setV] = useState({
    series: [] as string[],
    alpha: [] as string[],
    axis: "#777",
    grid: "#ccc",
    text: "#888",
    border: "#fff",
  });

  useEffect(() => {
    const series = [
      cssVar("--chart-1"),
      cssVar("--chart-2"),
      cssVar("--chart-3"),
    ].filter(Boolean);

    setV({
      series,
      alpha: series.map((c) => toAlpha(c, 0.18)),
      axis: cssVar("--chart-axis") || cssVar("--foreground") || "#777",
      grid: cssVar("--chart-grid") || "rgba(0,0,0,0.1)",
      text: cssVar("--chart-text") || cssVar("--foreground") || "#888",
      border: cssVar("--chart-border") || cssVar("--card") || "#fff",
    });
  }, [theme]);

  return v;
}

// ------- Component -------
interface WorkflowTokenUsageOverTimeProps {
  data: AnalyticsRow[];
}

export default function WorkflowTokenUsageOverTime({
  data,
}: WorkflowTokenUsageOverTimeProps) {
  const colors = useChartVars();

  const chartData = useMemo(() => {
    // 1) Top 3 workflows by total tokens
    const workflowTotals = data.reduce((acc, row) => {
      const w = row.workflow_name || "Unknown";
      const t = row.input_tokens + row.completion_tokens;
      acc[w] = (acc[w] || 0) + t;
      return acc;
    }, {} as Record<string, number>);

    const topWorkflows = Object.entries(workflowTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w);

    // 2) Aggregate per day per workflow
    const daily: Record<string, Record<string, number>> = {};
    data.forEach((row) => {
      const w = row.workflow_name || "Unknown";
      if (!topWorkflows.includes(w)) return;
      const d = new Date(row.timestamp).toLocaleDateString();
      daily[w] ||= {};
      const t = row.input_tokens + row.completion_tokens;
      daily[w][d] = (daily[w][d] || 0) + t;
    });

    // 3) Sorted unique dates
    const allDates = new Set<string>();
    Object.values(daily).forEach((m) => Object.keys(m).forEach((d) => allDates.add(d)));
    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // 4) Build datasets with theme colors
    const series = colors.series.length
      ? colors.series
      : ["#3b82f6", "#f59e0b", "#10b981"];
    const alpha = colors.alpha.length
      ? colors.alpha
      : series.map((c) => toAlpha(c, 0.18));

    const datasets = topWorkflows.map((w, i) => ({
      label: w,
      data: sortedDates.map((d) => daily[w]?.[d] || 0),
      borderColor: series[i % series.length],
      backgroundColor: alpha[i % alpha.length],
      fill: true,
      tension: 0.4,
    }));

    return { labels: sortedDates, datasets };
  }, [data, colors.series, colors.alpha]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: colors.text,
          font: { size: 12 },
          padding: 15,
          // قص أسماء الـworkflows في الـlegend
          generateLabels: (chart) => {
            const dsets = chart.data.datasets || [];
            return dsets.map((ds: any, i: number) => ({
              text: truncate20(String(ds.label ?? "")),
              fillStyle: ds.borderColor as string,
              strokeStyle: ds.borderColor as string,
              lineWidth: 2,
              hidden: false,
              datasetIndex: i,
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
    // عكس لون الشبكة مع لون الخط
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        grid: { color: colors.axis },
        ticks: {
          color: colors.grid,
          callback: (v) => Number(v).toLocaleString(),
          font: { size: 11 },
        },
      },
      x: {
        stacked: true,
        grid: { color: colors.axis },
        ticks: {
          color: colors.grid,
          font: { size: 10 },
          maxRotation: 45,
          autoSkip: true,
        },
      },
    },
  };

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
