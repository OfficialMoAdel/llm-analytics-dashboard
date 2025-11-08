import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { ModelDisplay, getModelIcon } from "@/utils/model-icon-map"

interface MetricsCardsProps {
  data: AnalyticsRow[]
}

export default function MetricsCards({ data }: MetricsCardsProps) {
  const totalTokens = data.reduce((sum, row) => sum + row.input_tokens + row.completion_tokens, 0)
  const totalCost = data.reduce((sum, row) => sum + row.total_cost, 0)

  // Find most used model
  const modelCounts = data.reduce(
    (acc, row) => {
      acc[row.llm_model] = (acc[row.llm_model] || 0) + row.input_tokens + row.completion_tokens
      return acc
    },
    {} as Record<string, number>,
  )

  const mostUsedModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]
  const mostUsedModelPercentage = mostUsedModel ? ((mostUsedModel[1] / totalTokens) * 100).toFixed(1) : "0"

  // Find top workflow
  const workflowTokens = data.reduce(
    (acc, row) => {
      const key = row.workflow_name || "Unknown"
      acc[key] = (acc[key] || 0) + row.input_tokens + row.completion_tokens
      return acc
    },
    {} as Record<string, number>,
  )

  const topWorkflow = Object.entries(workflowTokens).sort((a, b) => b[1] - a[1])[0]
  const topWorkflowPercentage = topWorkflow ? ((topWorkflow[1] / totalTokens) * 100).toFixed(1) : "0"

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <span className="text-2xl sm:text-xl">🔢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-xl font-bold">{totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">from previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <span className="text-2xl sm:text-xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">from previous period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used Model</CardTitle>
            {mostUsedModel?.[0] && (
              <img
                src={getModelIcon(mostUsedModel[0])}
                alt="Model"
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
              />
            )}
          </CardHeader>
          <CardContent>
            {mostUsedModel?.[0] ? (
              <ModelDisplay modelName={mostUsedModel[0]} className="text-lg sm:text-base font-bold" />
            ) : (
              <div className="text-lg sm:text-base font-bold">N/A</div>
            )}
            <p className="text-xs text-muted-foreground">{mostUsedModelPercentage}% of total tokens</p>
          </CardContent>
        </Card>

        {topWorkflow && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Workflow</CardTitle>
              <span className="text-2xl sm:text-xl">⚡</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-base font-bold break-words">{topWorkflow[0]}</div>
              <p className="text-xs text-muted-foreground">{topWorkflowPercentage}% of total tokens</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
