"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import React, { useMemo, useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";

// helpers to read CSS vars from globals.css
const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const MAX_LABEL = 20;
const truncate20 = (s: string) => (s?.length > MAX_LABEL ? s.slice(0, MAX_LABEL) + "..." : s);

function useChartVars() {
  const { theme } = useTheme();
  const [vars, setVars] = useState({ series: [] as string[], text: "#666", border: "#fff" });

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
    setVars({
      series,
      text: cssVar("--chart-text") || cssVar("--foreground") || "#666",
      border: cssVar("--chart-border") || cssVar("--card") || "#ffffff",
    });
  }, [theme]);

  return vars;
}

interface WorkflowCostComparisonProps {
  data: AnalyticsRow[];
}

export default function WorkflowCostComparison({ data }: WorkflowCostComparisonProps) {
  const isMobile = useIsMobile();
  const colors = useChartVars();

  const chartData = useMemo(() => {
    const workflowCosts = data.reduce((acc, row) => {
      const workflow = row.workflow_name || "Unknown";
      acc[workflow] = (acc[workflow] || 0) + row.total_cost;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(workflowCosts).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([workflow]) => workflow);
    const values = sorted.map(([, cost]) => cost);

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
            const d = chart.data;
            if (d.labels && d.labels.length && d.datasets.length) {
              return d.labels.map((label, i) => {
                const text = truncate20(String(label));
                const fill = Array.isArray(d.datasets[0].backgroundColor)
                  ? (d.datasets[0].backgroundColor as string[])[i]
                  : (d.datasets[0].backgroundColor as string);
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
            const label = truncate20(String(ctx.label ?? ""));
            const value = Number(ctx.parsed ?? 0);
            return `${label}: $${value.toFixed(5)}`;
          },
        },
      },
    },
    cutout: "60%",
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow Cost Comparison</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
