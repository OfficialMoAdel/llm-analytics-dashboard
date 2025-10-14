"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { AnalyticsRow } from "@/lib/fetch-data"
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react"

interface DetailedDataTableProps {
  data: AnalyticsRow[]
}

export default function DetailedDataTable({ data }: DetailedDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const sortedAndFilteredData = useMemo(() => {
    // First, sort the data by time
    const sorted = [...data].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB
    })

    // Then filter based on search term
    if (!searchTerm) return sorted

    const search = searchTerm.toLowerCase()
    return sorted.filter(
      (row) =>
        String(row.workflow_name || "")
          .toLowerCase()
          .includes(search) ||
        String(row.llm_model || "")
          .toLowerCase()
          .includes(search) ||
        String(row.execution_id || "")
          .toLowerCase()
          .includes(search) ||
        String(row.user_id || "")
          .toLowerCase()
          .includes(search),
    )
  }, [data, sortOrder, searchTerm])

  const totalPages = Math.ceil(sortedAndFilteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentData = sortedAndFilteredData.slice(startIndex, endIndex)

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Detailed Data</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="rows-per-page" className="text-sm text-muted-foreground">Show</label>
              <select
                id="rows-per-page"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm min-h-[36px]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-64 min-h-[44px] sm:min-h-[36px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch border rounded-lg">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={handleSortToggle}
                    className="flex items-center gap-1 font-medium hover:text-foreground transition-colors"
                  >
                    Time
                    {sortOrder === "desc" ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                  </button>
                </TableHead>
                <TableHead>Execution ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Prompt Tokens</TableHead>
                <TableHead className="text-right">Completion Tokens</TableHead>
                <TableHead className="text-right">Total Tokens</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead>Workflow Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, index) => {
                const { date, time } = formatDateTime(row.timestamp)
                return (
                  <TableRow key={`${row.execution_id}-${index}`}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm">{date}</span>
                        <span className="text-xs text-muted-foreground">{time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs sm:text-sm max-w-[100px] sm:max-w-[120px] truncate" title={row.execution_id}>
                      {row.execution_id}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm break-words max-w-[80px] sm:max-w-none">{row.user_id}</TableCell>
                    <TableCell className="break-words max-w-[120px] sm:max-w-none">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-lg sm:text-xl">🤖</span>
                        <span className="text-xs sm:text-sm break-words">{row.llm_model}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{row.input_tokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.completion_tokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {(row.input_tokens + row.completion_tokens).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">${row.total_cost.toFixed(5)}</TableCell>
                    <TableCell>{row.workflow_name}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, sortedAndFilteredData.length)} of{" "}
            {sortedAndFilteredData.length} entries
          </p>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="min-h-[36px] px-2 sm:px-3"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            {[...Array(Math.min(3, totalPages))].map((_, i) => {
              const pageNum = currentPage <= 2 ? i + 1 : currentPage - 1 + i
              if (pageNum > totalPages) return null
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="min-h-[36px] min-w-[36px] sm:min-w-[32px]"
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="min-h-[36px] px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
