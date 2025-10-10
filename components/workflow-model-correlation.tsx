"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import type { ChartOptions } from "chart.js"

interface WorkflowModelCorrelationProps {
  data: AnalyticsRow[]
}

export default function WorkflowModelCorrelation({ data }: WorkflowModelCorrelationProps) {
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
      x: {
        stacked: false,
      },
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
        <CardTitle>Workflow-Model Correlation</CardTitle>
        <p className="text-sm text-muted-foreground">Top 3 Workflows by Model Usage</p>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
