"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import type { ChartOptions } from "chart.js"
import { useIsMobile } from "@/hooks/use-mobile"

interface WorkflowModelCorrelationProps {
  data: AnalyticsRow[]
}

export default function WorkflowModelCorrelation({ data }: WorkflowModelCorrelationProps) {
  const isMobile = useIsMobile()

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

    // Get model usage for each workflow
    const workflowModelData: Record<string, Record<string, number>> = {}

    data.forEach((row) => {
      const workflow = row.workflow_name || "Unknown"
      if (!topWorkflows.includes(workflow)) return

      if (!workflowModelData[workflow]) {
        workflowModelData[workflow] = {}
      }

      const tokens = row.input_tokens + row.completion_tokens
      workflowModelData[workflow][row.llm_model] = (workflowModelData[workflow][row.llm_model] || 0) + tokens
    })

    // Get all unique models
    const allModels = new Set<string>()
    Object.values(workflowModelData).forEach((models) => {
      Object.keys(models).forEach((model) => allModels.add(model))
    })

    const chartColors = ["#4ade80", "#60a5fa", "#a78bfa", "#fbbf24", "#2dd4bf"]

    const datasets = Array.from(allModels).map((model, index) => ({
      label: model,
      data: topWorkflows.map((workflow) => workflowModelData[workflow]?.[model] || 0),
      backgroundColor: chartColors[index % chartColors.length],
    }))

    return {
      labels: topWorkflows,
      datasets,
    }
  }, [data])

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: isMobile ? false : true,
        position: "bottom",
        labels: {
          font: { size: isMobile ? 9 : 12 },
          padding: isMobile ? 8 : 15,
          boxWidth: isMobile ? 10 : 12,
          // ADD truncation for model names
          generateLabels: (chart) => {
            const datasets = chart.data.datasets
            return datasets.map((dataset, i) => {
              const label = dataset.label || ''
              const maxLength = isMobile ? 18 : 30
              const truncated = label.length > maxLength
                ? label.substring(0, maxLength) + '...'
                : label
              return {
                text: truncated,
                fillStyle: dataset.backgroundColor as string,
                hidden: false,
                index: i,
                datasetIndex: i,
              }
            })
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed?.y || 0
            return `${context.dataset.label}: ${value.toLocaleString()} tokens`
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          color: "rgba(255,255,255,0.08)"
        },
        ticks: {
          font: { size: isMobile ? 9 : 11 },
          color: "rgba(255,255,255,0.7)",
          maxRotation: 45,
          minRotation: 45, // ADD THIS
          autoSkip: true, // ADD THIS
          maxTicksLimit: isMobile ? 3 : undefined, // ADD THIS
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255,255,255,0.08)"
        },
        ticks: {
          callback: (value) => {
            const num = Number(value).toLocaleString()
            return isMobile && num.length > 8 ? num.substring(0, 6) + '...' : num
          },
          font: { size: isMobile ? 9 : 11 },
          color: "rgba(255,255,255,0.7)"
        },
      },
    },
  }

  return (
   <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow-Model Correlation</CardTitle>
        <p className="text-sm text-muted-foreground">Top 3 Workflows by Model Usage</p>
      </CardHeader>
  <CardContent className="flex-1">
    <div className="h-full min-h-[300px] w-full">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
