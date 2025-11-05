"use client";

import React, { useMemo } from "react";
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
import { createChartTheme, getChartColors } from "@/lib/chart-utils";

ChartJS.register(ArcElement, Tooltip, Legend);

const MAX_LABEL = 15;
const truncate15 = (s: string) => (s?.length > MAX_LABEL ? s.slice(0, MAX_LABEL) + "..." : s);

interface TokenUsageByModelProps {
  data: AnalyticsRow[];
}

export default React.memo(function TokenUsageByModel({
  data,
}: TokenUsageByModelProps) {
  const isMobile = useIsMobile();
  const theme = createChartTheme();
  const chartColors = getChartColors();

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
      (_, i) => chartColors[i % chartColors.length] || theme.toAlpha(chartColors[0], 0.8)
    );

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: palette,
          borderColor: theme.background,
          borderWidth: 2,
        },
      ],
    };
  }, [data, theme, chartColors]);

  const options: ChartOptions<"doughnut"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !isMobile,
          position: isMobile ? "bottom" : "right",
          labels: {
            color: theme.text,
            padding: isMobile ? 8 : 15,
            font: { size: isMobile ? 10 : 12 },
            boxWidth: isMobile ? 10 : 12,
            usePointStyle: true,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels && data.labels.length && data.datasets.length) {
                return (data.labels as (string | string[])[]).map((label, i) => {
                  const text = truncate15(String(label));
                  const fill = Array.isArray(data.datasets[0].backgroundColor)
                    ? (data.datasets[0].backgroundColor as string[])[i]
                    : (data.datasets[0].backgroundColor as string);
                  return {
                    text,
                    fillStyle: fill,
                    hidden: false,
                    index: i,
                    fontColor: theme.text,  // ← أضف هذا
                  };
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
              const label = truncate15(rawLabel);
              const value = Number(ctx.parsed ?? 0);
              const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
              const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";
              return `${label}: ${value.toLocaleString()} (${pct}%)`;
            },
          },
        },
      },
      cutout: "60%",
    }),
    [isMobile, theme]
  );

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
