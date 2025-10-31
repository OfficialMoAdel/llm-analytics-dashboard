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
import { useChartColors, truncate20 } from "@/hooks/use-chart-colors";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CostBreakdownByModelProps {
  data: AnalyticsRow[];
}

export default function CostBreakdownByModel({ data }: CostBreakdownByModelProps) {
  const isMobile = useIsMobile();
  const colors = useChartColors();

  const chartData = useMemo(() => {
    const modelCosts = data.reduce((acc, row) => {
      acc[row.llm_model] = (acc[row.llm_model] || 0) + row.total_cost;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(modelCosts).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([model]) => model);
    const vals = sorted.map(([, cost]) => cost);

    return {
      labels,
      datasets: [
        {
          label: "Cost ($)",
          data: vals,
          backgroundColor: colors.series[0] || "#3b82f6",
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
          label: (ctx) => `Cost: $${Number(ctx.parsed.x || 0).toFixed(5)}`,
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
          callback: (value) => `$${Number(value).toFixed(3)}`,
        },
      },
      y: {
    grid: { color: colors.axis },     // كان colors.grid
    ticks: {
      color: colors.grid,             // كان colors.axis
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
