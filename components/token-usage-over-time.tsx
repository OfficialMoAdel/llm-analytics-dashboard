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

// Helpers: read CSS vars + alpha + truncate
const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const toAlpha = (color: string, a = 0.18) => {
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.fillStyle = color;
  const rgb = ctx.fillStyle as string;
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return m ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})` : color;
};

function useChartVars() {
  const { theme } = useTheme();
  const [v, setV] = useState({
    series: [] as string[],
    alpha: [] as string[],
    axis: "#777",
    grid: "#ccc",
    text: "#888",
  });

  useEffect(() => {
    const s = [cssVar("--chart-1")].filter(Boolean); // سلسلة واحدة للرسم الخطي العام
    const series = s.length ? s : ["#3b82f6"];

    setV({
      series,
      alpha: series.map((c) => toAlpha(c, 0.18)),
      axis: cssVar("--chart-axis") || cssVar("--foreground") || "#777",
      grid: cssVar("--chart-grid") || "rgba(0,0,0,0.1)",
      text: cssVar("--chart-text") || cssVar("--foreground") || "#888",
    });
  }, [theme]);

  return v;
}

interface TokenUsageOverTimeProps {
  data: AnalyticsRow[];
}

export default function TokenUsageOverTime({ data }: TokenUsageOverTimeProps) {
  const colors = useChartVars();

  const chartData = useMemo(() => {
    const dailyTokens = data.reduce((acc, row) => {
      const date = new Date(row.timestamp).toLocaleDateString();
      const tokens = row.input_tokens + row.completion_tokens;
      acc[date] = (acc[date] || 0) + tokens;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(dailyTokens).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    return {
      labels: sorted.map(([date]) => date),
      datasets: [
        {
          label: "Token Usage",
          data: sorted.map(([, tokens]) => tokens),
          borderColor: colors.series[0],
          backgroundColor: colors.alpha[0],
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [data, colors.series, colors.alpha]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Tokens: ${Number(context.parsed?.y ?? 0).toLocaleString()}`,
        },
      },
    },
    // عكس لون الشبكة مع لون الخط
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: colors.axis },
        ticks: {
          color: colors.grid,
          callback: (value) => Number(value).toLocaleString(),
        },
      },
      x: {
        grid: { color: colors.axis },
        ticks: {
          color: colors.grid,
          autoSkip: true,
          maxRotation: 0,
        },
      },
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Token Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
