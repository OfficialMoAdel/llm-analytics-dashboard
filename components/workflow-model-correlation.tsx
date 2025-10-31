"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import React, { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
  ChartOptions,
} from "chart.js"
import { useIsMobile } from "@/hooks/use-mobile"
import { useChartColors, truncate20 } from "@/hooks/use-chart-colors"

ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip, Title)

interface Props {
  data: AnalyticsRow[]
}

export default function WorkflowModelCorrelation({ data }: Props) {
  const isMobile = useIsMobile()
  const colors = useChartColors()

  const { labels, datasets } = useMemo(() => {
    // اجمالي التوكن لكل وركفلو
    const workflowTotals = data.reduce((acc, row) => {
      const w = row.workflow_name || "Unknown"
      const t = (row.input_tokens || 0) + (row.completion_tokens || 0)
      acc[w] = (acc[w] || 0) + t
      return acc
    }, {} as Record<string, number>)

    // أعلى 3 وركفلو
    const topWorkflows = Object.entries(workflowTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w)

    // لكل وركفلو من الأعلى 3، احسب مجموع التوكن لكل موديل
    const modelByWorkflow: Record<string, Record<string, number>> = {}
    for (const row of data) {
      const w = row.workflow_name || "Unknown"
      if (!topWorkflows.includes(w)) continue
      const m = row.llm_model || "Unknown"
      const t = (row.input_tokens || 0) + (row.completion_tokens || 0)
      modelByWorkflow[w] ??= {}
      modelByWorkflow[w][m] = (modelByWorkflow[w][m] || 0) + t
    }

    // جميع الموديلات عبر الأعلى 3
    const allModels = Array.from(
      new Set(
        topWorkflows.flatMap((w) => Object.keys(modelByWorkflow[w] || {}))
      )
    )

    const lbls = topWorkflows
    const sets = allModels.map((model, idx) => {
      const color = colors.series[idx % colors.series.length] || "#60a5fa"
      const bg = colors.alpha[idx % colors.alpha.length] || "rgba(96,165,250,0.18)"
      return {
        label: model,
        data: lbls.map((w) => modelByWorkflow[w]?.[model] || 0),
        backgroundColor: bg,
        borderColor: color,
        borderWidth: 1.5,
      }
    })

    return { labels: lbls, datasets: sets }
  }, [data, colors.series, colors.alpha])

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !isMobile,
          position: "bottom",
          labels: {
            color: colors.text,          // لون نص الليجند
            padding: isMobile ? 8 : 14,
            boxWidth: isMobile ? 10 : 12,
            font: { size: isMobile ? 10 : 12 },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label(ctx) {
              const v = Number(ctx.parsed.y || 0)
              return `${ctx.dataset.label}: ${v.toLocaleString()}`
            },
          },
        },
        title: {
          display: false,
          text: "",
          color: colors.text,
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { color: colors.grid },       // لون الشبكة
          border: { color: colors.axis },     // لون خط المحور
          ticks: {
            color: colors.text,               // لون نص التكات
            font: { size: isMobile ? 10 : 11 },
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            callback(value: any) {
              // @ts-ignore
              const label = this.getLabelForValue?.(Number(value)) ?? String(value)
              return truncate20(String(label))
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: colors.grid },
          border: { color: colors.axis },
          ticks: {
            color: colors.text,
            font: { size: isMobile ? 10 : 11 },
            callback: (v) => Number(v).toLocaleString(),
          },
        },
      },
    }),
    [isMobile, colors.text, colors.grid, colors.axis]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow–Model Correlation</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px] sm:h-[360px]">
        <Bar data={{ labels, datasets }} options={options} />
      </CardContent>
    </Card>
  )
}
