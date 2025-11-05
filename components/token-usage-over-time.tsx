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
import { getChartTheme, filterValidDates } from "@/lib/chart-theme";

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

interface TokenUsageOverTimeProps {
  data: AnalyticsRow[];
}

export default function TokenUsageOverTime({ data }: TokenUsageOverTimeProps) {
  const theme = getChartTheme();

  const chartData = useMemo(() => {
    // Filter out invalid dates before processing
    const validData = filterValidDates(data, 'timestamp');

    const dailyTokens = validData.reduce((acc, row) => {
      const date = new Date(row.timestamp);
      // Double-check the date is valid after filtering
      if (isNaN(date.getTime()) || date.toString() === 'Invalid Date') {
        return acc;
      }
      const dateStr = date.toLocaleDateString();
      const tokens = row.input_tokens + row.completion_tokens;
      acc[dateStr] = (acc[dateStr] || 0) + tokens;
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
          borderColor: theme.primaryStroke,
          backgroundColor: theme.primaryFill,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        },
      ],
    };
  }, [data, theme.primaryFill, theme.primaryStroke]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Tokens: ${Number(context.parsed?.y ?? 0).toLocaleString()}`,
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
          callback: (value) => Number(value).toLocaleString(),
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
