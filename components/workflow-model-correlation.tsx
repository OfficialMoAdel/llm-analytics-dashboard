"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { getChartColors } from "@/lib/chart-utils";

const truncate20 = (s: string) => (s?.length > 20 ? s.slice(0, 20) + "..." : s);

interface Props {
  data: AnalyticsRow[];
}

export default function WorkflowModelCorrelation({ data }: Props) {
  const isMobile = useIsMobile();
  const chartColors = getChartColors();

  const { chartData, models } = useMemo(() => {
    const workflowTotals = data.reduce((acc, row) => {
      const w = row.workflow_name || "Unknown";
      const t = (row.input_tokens || 0) + (row.completion_tokens || 0);
      acc[w] = (acc[w] || 0) + t;
      return acc;
    }, {} as Record<string, number>);

    const topWorkflows = Object.entries(workflowTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([w]) => w);

    const modelByWorkflow: Record<string, Record<string, number>> = {};
    for (const row of data) {
      const w = row.workflow_name || "Unknown";
      if (!topWorkflows.includes(w)) continue;
      const m = row.llm_model || "Unknown";
      const t = (row.input_tokens || 0) + (row.completion_tokens || 0);
      modelByWorkflow[w] ??= {};
      modelByWorkflow[w][m] = (modelByWorkflow[w][m] || 0) + t;
    }

    const allModels = Array.from(
      new Set(
        topWorkflows.flatMap((w) => Object.keys(modelByWorkflow[w] || {}))
      )
    );

    const dataPoints = topWorkflows.map((workflow) => {
      const dataPoint: any = { workflow: truncate20(workflow) };
      allModels.forEach((model) => {
        dataPoint[model] = modelByWorkflow[workflow]?.[model] || 0;
      });
      return dataPoint;
    });

    const modelColors = allModels.map((_, idx) => chartColors[idx % chartColors.length]);

    return {
      chartData: dataPoints,
      models: allModels.map((model, idx) => ({
        name: model,
        color: modelColors[idx],
      })),
    };
  }, [data, chartColors]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Workflow–Model Correlation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="workflow"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: isMobile ? 10 : 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: isMobile ? 10 : 11 }}
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
                          {payload.map((entry, index) => (
                            <div key={index} className="flex flex-col">
                              <span className="font-bold" style={{ color: entry.color }}>
                                {entry.dataKey}
                              </span>
                              <span className="text-muted-foreground">
                                Tokens: {Number(entry.value ?? 0).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {!isMobile && (
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "15px" }}
                />
              )}
              {models.map((model) => (
                <Bar
                  key={model.name}
                  dataKey={model.name}
                  fill={model.color}
                  // fillOpacity={0.5}
                 stroke={model.color}
                  strokeWidth={1.5}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
