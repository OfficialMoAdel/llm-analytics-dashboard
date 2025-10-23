"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { useIsMobile } from "@/hooks/use-mobile"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface CostBreakdownByModelProps {
  data: AnalyticsRow[]
}

export default function CostBreakdownByModel({ data }: CostBreakdownByModelProps) {
  const isMobile = useIsMobile()

  const chartData = useMemo(() => {
    const modelCosts = data.reduce(
      (acc, row) => {
        acc[row.llm_model] = (acc[row.llm_model] || 0) + row.total_cost
        return acc
      },
      {} as Record<string, number>,
    )

    const sorted = Object.entries(modelCosts).sort((a, b) => b[1] - a[1])

    return {
      labels: sorted.map(([model]) => model),
      datasets: [
        {
          label: "Cost ($)",
          data: sorted.map(([, cost]) => cost),
          backgroundColor: "#3b82f6",
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
            return `Cost: $${(context.parsed.x || 0).toFixed(5)}`
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
          callback: (value) => `$${Number(value).toFixed(3)}`,
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
        <CardTitle>Cost Breakdown by Model</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] sm:h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
