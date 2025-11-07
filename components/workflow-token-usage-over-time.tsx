"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getChartColors } from "@/lib/chart-utils";
import { filterValidDates } from "@/lib/chart-theme";

const truncate20 = (s: string) => (s?.length > 20 ? s.slice(0, 20) + "..." : s);

interface WorkflowTokenUsageOverTimeProps {
  data: AnalyticsRow[];
}

export default function WorkflowTokenUsageOverTime({
  data,
}: WorkflowTokenUsageOverTimeProps) {
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const validData = filterValidDates(data, "timestamp");

    const workflowTotals = validData.reduce((acc, row) => {
      const w = row.workflow_name || "Unknown";
      const t = row.input_tokens + row.completion_tokens;
      acc[w] = (acc[w] || 0) + t;
      return acc;
    }, {} as Record<string, number>);

    const topWorkflows = Object.entries(workflowTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w);

    const daily: Record<string, Record<string, number>> = {};
    validData.forEach((row) => {
      const w = row.workflow_name || "Unknown";
      if (!topWorkflows.includes(w)) return;

      const date = new Date(row.timestamp);
      if (isNaN(date.getTime()) || date.toString() === "Invalid Date") {
        return;
      }

      const d = date.toLocaleDateString();
      daily[w] ||= {};
      const t = row.input_tokens + row.completion_tokens;
      daily[w][d] = (daily[w][d] || 0) + t;
    });

    const allDates = new Set<string>();
    Object.values(daily).forEach((m) => Object.keys(m).forEach((d) => allDates.add(d)));
    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Transform to Recharts format
    const result = sortedDates.map((date) => {
      const dataPoint: any = { date };
      topWorkflows.forEach((w) => {
        const workflowKey = w.length > 20 ? w.slice(0, 17) + "..." : w;
        dataPoint[workflowKey] = daily[w]?.[date] || 0;
      });
      return dataPoint;
    });

    return {
      data: result,
      workflows: topWorkflows.map((w, i) => ({
        name: w.length > 20 ? w.slice(0, 17) + "..." : w,
        fullName: w,
        color: chartColors[i % chartColors.length],
      })),
    };
  }, [data, chartColors]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow Token Usage Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Token Usage Trends for Top 3 Workflows
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => Number(value).toLocaleString()}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid gap-2">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {label}
                          </span>
                          {payload.map((entry, index) => {
                            const workflow = chartData.workflows[index];
                            return (
                              <div key={index} className="flex flex-col">
                                <span className="font-bold" style={{ color: entry.color }}>
                                  {workflow.fullName}
                                </span>
                                <span className="text-muted-foreground">
                                  Tokens: {Number(entry.value ?? 0).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "15px" }}
                iconType="line"
              />
              {chartData.workflows.map((workflow, index) => (
                <Line
                  key={workflow.fullName}
                  type="monotone"
                  dataKey={workflow.name}
                  stroke={workflow.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  fill={workflow.color}
                  fillOpacity={0.1}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
