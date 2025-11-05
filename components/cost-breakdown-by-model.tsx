"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { useIsMobile } from "@/hooks/use-mobile";
import { createChartTheme, getChartColors } from "@/lib/chart-utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const truncate15 = (s: string) => (s?.length > 15 ? s.slice(0, 15) + "..." : s);

interface CostBreakdownByModelProps {
  data: AnalyticsRow[];
}

export default function CostBreakdownByModel({ data }: CostBreakdownByModelProps) {
  const isMobile = useIsMobile();
  const theme = createChartTheme();
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const modelCosts = data.reduce((acc, row) => {
      acc[row.llm_model] = (acc[row.llm_model] || 0) + row.total_cost;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(modelCosts).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([model]) => model);
    const vals = sorted.map(([, cost]) => cost);

    // Apply color palette to each bar
    const palette = labels.map(
      (_, i) => chartColors[i % chartColors.length] || theme.toAlpha(chartColors[0], 0.8)
    );

    return {
      labels,
      datasets: [
        {
          label: "Cost ($)",
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
          label: (ctx) => `Cost: $${Number(ctx.parsed.x || 0).toFixed(5)}`,
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
          callback: (value) => `$${Number(value).toFixed(3)}`,
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
            return truncate15(label);
          },
        },
      },
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Cost Breakdown by Model</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
