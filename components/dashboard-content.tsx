"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RefreshCw, Filter, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
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
  
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedWorkflow, setSelectedWorkflow] = useState("all")

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

  const workflows = useMemo(() => {
    const unique = new Set(data.map((row) => row.workflow_name).filter(Boolean))
    return Array.from(unique).sort()
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (startDate && row.timestamp) {
        const rowDate = new Date(row.timestamp)
        const startDateTime = new Date(startDate)
        startDateTime.setHours(0, 0, 0, 0)
        if (rowDate < startDateTime) return false
      }

      if (endDate && row.timestamp) {
        const rowDate = new Date(row.timestamp)
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        if (rowDate > endDateTime) return false
      }

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-2xl">🤖📊</span>
              LLM Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Monitor and analyze your AI model token usage and costs</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <ThemeToggle />
            
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] items-end gap-4">
              <div className="grid gap-2 w-full sm:w-auto min-w-[200px]">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2 w-full sm:w-auto min-w-[200px]">
                <Label htmlFor="end-date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2 w-full sm:w-auto min-w-[200px]">
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

              <div className="grid grid-cols-[48px_1fr] gap-3 w-full
                      lg:flex lg:justify-end lg:items-center lg:gap-2 lg:w-auto lg:col-start-4">
        <Button variant="outline" size="icon"
                className="h-10 w-10 rounded-md lg:h-9 lg:w-9">
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button className="w-full lg:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>
      </div>
            </div>
          </CardContent>
        </Card>

        <MetricsCards data={filteredData} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-8">
          <TokenUsageByModel data={filteredData} />
          <TokenUsageOverTime data={filteredData} />
          <CostBreakdownByModel data={filteredData} />
          <TokenUsageByWorkflow data={filteredData} />
          <WorkflowCostComparison data={filteredData} />
          <WorkflowModelCorrelation data={filteredData} />
          <div className="md:col-span-2 lg:col-span-2">
            <WorkflowTokenUsageOverTime data={filteredData} />
          </div>
        </div>

        <div className="mt-8">
          <DetailedDataTable data={filteredData} />
        </div>
      </div>
    </div>
  )
}
