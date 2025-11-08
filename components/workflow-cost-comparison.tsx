"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { getChartColors } from "@/lib/chart-utils";
import { RechartsLegend } from "@/components/charts";

const MAX_LABEL = 20;
const truncate20 = (s: string) => (s?.length > MAX_LABEL ? s.slice(0, MAX_LABEL) + "..." : s);

interface WorkflowCostComparisonProps {
  data: AnalyticsRow[];
}

export default function WorkflowCostComparison({ data }: WorkflowCostComparisonProps) {
  const isMobile = useIsMobile();
  const chartColors = getChartColors();
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

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

  const visibleData = useMemo(() => {
    return chartData.filter(item => !hiddenItems.has(item.name));
  }, [chartData, hiddenItems]);

  const handleLegendClick = (dataKey: string) => {
    setHiddenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  const legendPayload = useMemo(() => {
    return chartData.map(item => ({
      value: item.displayName,
      color: item.fill,
      id: item.name,
    }));
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow Cost Comparison</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full flex">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 70 : 90}
                  outerRadius={isMobile ? 120 : 140}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {visibleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const displayValue = Number(data.value || 0);
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="grid gap-2">
                            <span className="font-bold">{data.name}</span>
                            <span className="text-muted-foreground">
                              Cost: ${isNaN(displayValue) ? "0.00000" : displayValue.toFixed(5)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
      {!isMobile && (
      <div className="flex items-center"> {/* ✅ محاذاة عمودية */}
        <RechartsLegend
          position="right"
          onItemClick={handleLegendClick}
          hiddenItems={hiddenItems}
          payload={legendPayload}
        />
      </div>
    )}
  </div>
      </CardContent>
    </Card>
  );
}
