"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Doughnut } from "react-chartjs-2"
import type { ChartOptions } from "chart.js"

interface WorkflowCostComparisonProps {
  data: AnalyticsRow[]
}

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"]

export default function WorkflowCostComparison({ data }: WorkflowCostComparisonProps) {
  const chartData = useMemo(() => {
    const workflowCosts = data.reduce(
      (acc, row) => {
        const workflow = row.workflow_name || "Unknown"
        acc[workflow] = (acc[workflow] || 0) + row.total_cost
        return acc
      },
      {} as Record<string, number>,
    )

    const sorted = Object.entries(workflowCosts).sort((a, b) => b[1] - a[1])

    return {
      labels: sorted.map(([workflow]) => workflow),
      datasets: [
        {
          data: sorted.map(([, cost]) => cost),
          backgroundColor: COLORS,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    }
  }, [data])

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed || 0
            return `${label}: $${value.toFixed(5)}`
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Cost Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
