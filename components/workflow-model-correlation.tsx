"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
  ChartOptions,
} from "chart.js";
import { useIsMobile } from "@/hooks/use-mobile";
import { createChartTheme, getChartColors } from "@/lib/chart-utils";

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title);

const truncate20 = (s: string) => (s?.length > 20 ? s.slice(0, 20) + "..." : s);

interface Props {
  data: AnalyticsRow[];
}

export default function WorkflowModelCorrelation({ data }: Props) {
  const isMobile = useIsMobile();
  const theme = createChartTheme();
  const chartColors = getChartColors();

  const { labels, datasets } = useMemo(() => {
    // Total tokens per workflow
    const workflowTotals = data.reduce((acc, row) => {
      const w = row.workflow_name || "Unknown";
      const t = (row.input_tokens || 0) + (row.completion_tokens || 0);
      acc[w] = (acc[w] || 0) + t;
      return acc;
    }, {} as Record<string, number>);

    // Top 3 workflows
    const topWorkflows = Object.entries(workflowTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w);

    // For each of top 3 workflows, calculate total tokens per model
    const modelByWorkflow: Record<string, Record<string, number>> = {};
    for (const row of data) {
      const w = row.workflow_name || "Unknown";
      if (!topWorkflows.includes(w)) continue;
      const m = row.llm_model || "Unknown";
      const t = (row.input_tokens || 0) + (row.completion_tokens || 0);
      modelByWorkflow[w] ??= {};
      modelByWorkflow[w][m] = (modelByWorkflow[w][m] || 0) + t;
    }

    // All models across top 3 workflows
    const allModels = Array.from(
      new Set(
        topWorkflows.flatMap((w) => Object.keys(modelByWorkflow[w] || {}))
      )
    );

    const lbls = topWorkflows;
    const sets = allModels.map((model, idx) => {
      const color = chartColors[idx % chartColors.length] || theme.primary;
      const bg = theme.toAlpha(color, 0.5);
      return {
        label: model,
        data: lbls.map((w) => modelByWorkflow[w]?.[model] || 0),
        backgroundColor: bg,
        borderColor: color,
        borderWidth: 1.5,
      };
    });

    return { labels: lbls, datasets: sets };
  }, [data, theme, chartColors]);

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !isMobile,
          position: "bottom",
          labels: {
            color: theme.text,
            padding: isMobile ? 8 : 14,
            boxWidth: isMobile ? 10 : 12,
            font: { size: isMobile ? 10 : 12 },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label(ctx) {
              const v = Number(ctx.parsed.y || 0);
              return `${ctx.dataset.label}: ${v.toLocaleString()}`;
            },
          },
        },
        title: {
          display: false,
          text: "",
          color: theme.text,
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: {
            color: theme.grid,
          },
          ticks: {
            color: theme.text,
            font: { size: isMobile ? 10 : 11 },
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            callback(value: any) {
              // @ts-ignore
              const label = this.getLabelForValue?.(Number(value)) ?? String(value);
              return truncate20(String(label));
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: theme.grid,
          },
          ticks: {
            color: theme.text,
            font: { size: isMobile ? 10 : 11 },
            callback: (v) => Number(v).toLocaleString(),
          },
        },
      },
    }),
    [isMobile, theme]
  );

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow–Model Correlation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <Bar data={{ labels, datasets }} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
