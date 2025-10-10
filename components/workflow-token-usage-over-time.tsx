"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Line } from "react-chartjs-2"
import type { ChartOptions } from "chart.js"

interface WorkflowTokenUsageOverTimeProps {
  data: AnalyticsRow[]
}

export default function WorkflowTokenUsageOverTime({ data }: WorkflowTokenUsageOverTimeProps) {
  const chartData = useMemo(() => {
    // Get top 3 workflows
    const workflowTokens = data.reduce(
      (acc, row) => {
        const workflow = row.workflow_name || "Unknown"
        const tokens = row.input_tokens + row.completion_tokens
        acc[workflow] = (acc[workflow] || 0) + tokens
        return acc
      },
      {} as Record<string, number>,
    )

    const topWorkflows = Object.entries(workflowTokens)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([workflow]) => workflow)

    // Get daily tokens for each workflow
    const workflowDailyData: Record<string, Record<string, number>> = {}

    data.forEach((row) => {
      const workflow = row.workflow_name || "Unknown"
      if (!topWorkflows.includes(workflow)) return

      const date = new Date(row.timestamp).toLocaleDateString()

      if (!workflowDailyData[workflow]) {
        workflowDailyData[workflow] = {}
      }

      const tokens = row.input_tokens + row.completion_tokens
      workflowDailyData[workflow][date] = (workflowDailyData[workflow][date] || 0) + tokens
    })

    // Get all unique dates
    const allDates = new Set<string>()
    Object.values(workflowDailyData).forEach((dates) => {
      Object.keys(dates).forEach((date) => allDates.add(date))
    })

    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    const colors = ["#3b82f6", "#f59e0b", "#10b981"]

    const datasets = topWorkflows.map((workflow, index) => ({
      label: workflow,
      data: sortedDates.map((date) => workflowDailyData[workflow]?.[date] || 0),
      borderColor: colors[index],
      backgroundColor: `${colors[index]}33`,
      fill: true,
      tension: 0.4,
    }))

    return {
      labels: sortedDates,
      datasets,
    }
  }, [data])

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} tokens`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          callback: (value) => value.toLocaleString(),
        },
      },
      x: {
        stacked: true,
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Token Usage Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">Token Usage Trends for Top 3 Workflows</p>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
