"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Line } from "react-chartjs-2"
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
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface TokenUsageOverTimeProps {
  data: AnalyticsRow[]
}

export default function TokenUsageOverTime({ data }: TokenUsageOverTimeProps) {
  const chartData = useMemo(() => {
    const dailyTokens = data.reduce(
      (acc, row) => {
        const date = new Date(row.timestamp).toLocaleDateString()
        const tokens = row.input_tokens + row.completion_tokens
        acc[date] = (acc[date] || 0) + tokens
        return acc
      },
      {} as Record<string, number>,
    )

    const sorted = Object.entries(dailyTokens).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())

    return {
      labels: sorted.map(([date]) => date),
      datasets: [
        {
          label: "Token Usage",
          data: sorted.map(([, tokens]) => tokens),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }, [data])

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Tokens: ${(context.parsed.y ?? 0).toLocaleString()}`
          },
        },
      },
    },
    scales: {
      y: {
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
        <CardTitle>Token Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] sm:h-[400px]">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
