"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import type { ChartOptions } from "chart.js"
import { useIsMobile } from "@/hooks/use-mobile"

interface TokenUsageByWorkflowProps {
  data: AnalyticsRow[]
}

export default function TokenUsageByWorkflow({ data }: TokenUsageByWorkflowProps) {
  const isMobile = useIsMobile()

  const chartData = useMemo(() => {
    const workflowTokens = data.reduce(
      (acc, row) => {
        const workflow = row.workflow_name || "Unknown"
        const tokens = row.input_tokens + row.completion_tokens
        acc[workflow] = (acc[workflow] || 0) + tokens
        return acc
      },
      {} as Record<string, number>,
    )

    const sorted = Object.entries(workflowTokens).sort((a, b) => b[1] - a[1])

    return {
      labels: sorted.map(([workflow]) => workflow),
      datasets: [
        {
          label: "Total Tokens",
          data: sorted.map(([, tokens]) => tokens),
          backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"],
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
            return `Tokens: ${(context.parsed.x || 0).toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(255,255,255,0.08)"
        },
        ticks: {
          callback: (value) => value.toLocaleString(),
          font: { size: isMobile ? 9 : 11 },
          color: "rgba(255,255,255,0.7)"
        },
      },
      y: {
        grid: {
          color: "rgba(255,255,255,0.08)"
        },
        ticks: {
          font: { size: isMobile ? 9 : 11 },
          color: "rgba(255,255,255,0.7)",
          // ADD THIS callback for truncation
          callback: function(value) {
            const label = this.getLabelForValue(Number(value))
            const maxLength = isMobile ? 15 : 25
            return label.length > maxLength
              ? label.substring(0, maxLength) + '...'
              : label
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage by Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] sm:h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
