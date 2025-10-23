"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import type { ChartOptions } from "chart.js"

interface ToolUsageDistributionProps {
  data: AnalyticsRow[]
}

export default function ToolUsageDistribution({ data }: ToolUsageDistributionProps) {
  const chartData = useMemo(() => {
    const toolTokens = data.reduce(
      (acc, row) => {
        if (row.tool) {
          const tokens = row.input_tokens + row.completion_tokens
          acc[row.tool] = (acc[row.tool] || 0) + tokens
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const sorted = Object.entries(toolTokens).sort((a, b) => b[1] - a[1])

    return {
      labels: sorted.map(([tool]) => tool),
      datasets: [
        {
          label: "Tokens",
          data: sorted.map(([, tokens]) => tokens),
          backgroundColor: ["#f59e0b", "#10b981", "#3b82f6"],
        },
      ],
    }
  }, [data])

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Tokens: ${(context.parsed.x ?? 0).toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString(),
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Usage Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] sm:h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
