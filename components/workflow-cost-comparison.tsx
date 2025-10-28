"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Doughnut } from "react-chartjs-2"
import type { ChartOptions } from "chart.js"
import { useIsMobile } from "@/hooks/use-mobile"

interface WorkflowCostComparisonProps {
  data: AnalyticsRow[]
}

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"]

export default function WorkflowCostComparison({ data }: WorkflowCostComparisonProps) {
  const isMobile = useIsMobile()

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
        display: isMobile ? false : true,
        position: isMobile ? "bottom" : "right", // CHANGE THIS
        labels: {
          padding: isMobile ? 8 : 15,
          font: { size: isMobile ? 10 : 12 },
          boxWidth: isMobile ? 10 : 12,
          // ADD truncation like pie chart
          generateLabels: (chart) => {
            const data = chart.data
            if (data.labels && data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const maxLength = isMobile ? 15 : 25
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
            return `${label}: $${value.toFixed(5)}`
          },
        },
      },
    },
    cutout: "60%",
  }

  return (
<Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow Cost Comparison</CardTitle>
      </CardHeader>
  <CardContent className="flex-1">
    <div className="h-full min-h-[300px] w-full">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
