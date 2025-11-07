"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { getChartColors } from "@/lib/chart-utils";

const MAX_LABEL = 20;
const truncate20 = (s: string) => (s?.length > MAX_LABEL ? s.slice(0, MAX_LABEL) + "..." : s);

interface WorkflowCostComparisonProps {
  data: AnalyticsRow[];
}

export default function WorkflowCostComparison({ data }: WorkflowCostComparisonProps) {
  const isMobile = useIsMobile();
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const workflowCosts = data.reduce((acc, row) => {
      const workflow = row.workflow_name || "Unknown";
      acc[workflow] = (acc[workflow] || 0) + row.total_cost;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(workflowCosts).sort((a, b) => b[1] - a[1]);

    return sorted.map(([workflow, cost], index) => ({
      name: workflow,
      displayName: truncate20(workflow),
      value: cost,
      fill: chartColors[index % chartColors.length],
    }));
  }, [data, chartColors]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow Cost Comparison</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 80 : 100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid gap-2">
                          <span className="font-bold">{data.name}</span>
                          <span className="text-muted-foreground">
                            Cost: ${Number(data.value).toFixed(5)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {!isMobile && (
                <Legend
                  wrapperStyle={{ fontSize: "12px", padding: "15px" }}
                  iconType="circle"
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
