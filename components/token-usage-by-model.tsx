"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TokenUsageByModelProps {
  data: AnalyticsRow[];
}

// helpers: read CSS variables from globals.css and build series/colors
const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const MAX_LABEL = 20;
const truncate20 = (s: string) => (s?.length > MAX_LABEL ? s.slice(0, MAX_LABEL) + "..." : s);

function useChartVars() {
  const { theme } = useTheme();
  const [vars, setVars] = useState({
    series: [] as string[],
    text: "#666",
    border: "#fff",
  });

  useEffect(() => {
    const series = [
      cssVar("--chart-1"),
      cssVar("--chart-2"),
      cssVar("--chart-3"),
      cssVar("--chart-4"),
      cssVar("--chart-5"),
      cssVar("--chart-6"),
      cssVar("--chart-7"),
      cssVar("--chart-8"),
    ].filter(Boolean);

    const text = cssVar("--chart-text") || cssVar("--foreground") || "#666";
    const border =
      cssVar("--chart-border") || cssVar("--card") || "#ffffff";

    setVars({ series, text, border });
  }, [theme]);

  return vars;
}

export default React.memo(function TokenUsageByModel({
  data,
}: TokenUsageByModelProps) {
  const isMobile = useIsMobile();
  const colors = useChartVars();

  const chartData = useMemo(() => {
    const modelTokens = data.reduce((acc, row) => {
      const tokens = row.input_tokens + row.completion_tokens;
      acc[row.llm_model] = (acc[row.llm_model] || 0) + tokens;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(modelTokens).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([model]) => model);
    const values = sorted.map(([, v]) => v);

    const palette = labels.map(
      (_, i) => colors.series[i % Math.max(colors.series.length, 1)]
    );

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: palette,
          borderColor: colors.border,
          borderWidth: 2,
        },
      ],
    };
  }, [data, colors]);

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !isMobile,
        position: isMobile ? "bottom" : "right",
        labels: {
          color: colors.text,
          padding: isMobile ? 8 : 15,
          font: { size: isMobile ? 10 : 12 },
          boxWidth: isMobile ? 10 : 12,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.labels.length && data.datasets.length) {
              return (data.labels as (string | string[])[]).map((label, i) => {
                const text = truncate20(String(label));
                const fill = Array.isArray(data.datasets[0].backgroundColor)
                  ? (data.datasets[0].backgroundColor as string[])[i]
                  : (data.datasets[0].backgroundColor as string);
                return { text, fillStyle: fill, hidden: false, index: i };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const rawLabel = String(ctx.label ?? "");
            const label = truncate20(rawLabel);
            const value = Number(ctx.parsed ?? 0);
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";
            return `${label}: ${value.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Token Usage by Model</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
});
