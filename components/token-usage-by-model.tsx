"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from "chart.js"
import { useIsMobile } from "@/hooks/use-mobile"
import React from "react"

ChartJS.register(ArcElement, Tooltip, Legend)

interface TokenUsageByModelProps {
  data: AnalyticsRow[]
}

const COLORS = [
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
]

export default React.memo(function TokenUsageByModel({ data }: TokenUsageByModelProps)  {
  const isMobile = useIsMobile()

  const chartData = useMemo(() => {
    const modelTokens = data.reduce(
      (acc, row) => {
        const tokens = row.input_tokens + row.completion_tokens
        acc[row.llm_model] = (acc[row.llm_model] || 0) + tokens
        return acc
      },
      {} as Record<string, number>,
    )

    const sorted = Object.entries(modelTokens).sort((a, b) => b[1] - a[1])

    return {
      labels: sorted.map(([model]) => model),
      datasets: [
        {
          data: sorted.map(([, tokens]) => tokens),
          backgroundColor: COLORS,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }
  }, [data])

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: isMobile ? false : true,
        position: "bottom",
        labels: {
          padding: isMobile ? 8 : 15,
          font: {
            size: isMobile ? 9 : 11
          },
          boxWidth: isMobile ? 10 : 12,
          // ADD THIS - Truncate long model names
          generateLabels: (chart) => {
            const data = chart.data
            if (data.labels && data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const maxLength = isMobile ? 18 : 30
                const labelStr = String(label)
                const truncated = labelStr.length > maxLength
                  ? labelStr.substring(0, maxLength) + '...'
                  : labelStr

                return {
                  text: truncated,
                  fillStyle: Array.isArray(data.datasets[0].backgroundColor)
                    ? data.datasets[0].backgroundColor[i] as string
                    : data.datasets[0].backgroundColor as string,
                  hidden: false,
                  index: i,
                }
              })
            }
            return []
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value.toLocaleString()} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
<Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Token Usage by Model</CardTitle>
      </CardHeader>
  <CardContent className="flex-1">
    <div className="h-full min-h-[300px] w-full">
          <Pie data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
} )