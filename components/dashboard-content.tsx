"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Filter } from "lucide-react"
import { fetchGoogleSheetData, type AnalyticsRow } from "@/lib/fetch-data"
import { ThemeToggle } from "@/components/theme-toggle"
import MetricsCards from "@/components/metrics-cards"
import TokenUsageByModel from "@/components/token-usage-by-model"
import TokenUsageOverTime from "@/components/token-usage-over-time"
import CostBreakdownByModel from "@/components/cost-breakdown-by-model"
import TokenUsageByWorkflow from "@/components/token-usage-by-workflow"
import WorkflowCostComparison from "@/components/workflow-cost-comparison"
import WorkflowModelCorrelation from "@/components/workflow-model-correlation"
import WorkflowTokenUsageOverTime from "@/components/workflow-token-usage-over-time"
import DetailedDataTable from "@/components/detailed-data-table"

export default function DashboardContent() {
  const [data, setData] = useState<AnalyticsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Filter states
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedWorkflow, setSelectedWorkflow] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await fetchGoogleSheetData()
      setData(result)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Get unique workflows for filter dropdown
  const workflows = useMemo(() => {
    const unique = new Set(data.map((row) => row.workflow_name).filter(Boolean))
    return Array.from(unique).sort()
  }, [data])

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Date filter
      if (startDate && row.timestamp) {
        const rowDate = new Date(row.timestamp)
        if (rowDate < new Date(startDate)) return false
      }
      if (endDate && row.timestamp) {
        const rowDate = new Date(row.timestamp)
        if (rowDate > new Date(endDate)) return false
      }

      // Workflow filter
      if (selectedWorkflow !== "all" && row.workflow_name !== selectedWorkflow) {
        return false
      }

      return true
    })
  }, [data, startDate, endDate, selectedWorkflow])

  const handleRefresh = () => {
    loadData()
  }

  if (loading && data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="text-4xl">🤖📊</div>
              <h1 className="text-balance text-3xl font-bold tracking-tight">LLM Analytics Dashboard</h1>
            </div>
            <p className="mt-2 text-pretty text-sm text-muted-foreground">
              Monitor and analyze your AI model token usage and costs
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow">Workflow</Label>
                <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                  <SelectTrigger id="workflow">
                    <SelectValue placeholder="All Workflows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Workflows</SelectItem>
                    {workflows.map((workflow) => (
                      <SelectItem key={workflow} value={workflow}>
                        {workflow}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleRefresh} variant="outline" size="icon" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button className="flex-1">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        <MetricsCards data={filteredData} />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TokenUsageByModel data={filteredData} />
          <TokenUsageOverTime data={filteredData} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CostBreakdownByModel data={filteredData} />
          <TokenUsageByWorkflow data={filteredData} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <WorkflowCostComparison data={filteredData} />
          <WorkflowModelCorrelation data={filteredData} />
        </div>

        <WorkflowTokenUsageOverTime data={filteredData} />

        {/* Detailed Data Table */}
        <DetailedDataTable data={filteredData} searchQuery={searchQuery} />
      </div>
    </div>
  )
}
