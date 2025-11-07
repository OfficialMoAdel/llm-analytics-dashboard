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
  Cell,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { getChartColors } from "@/lib/chart-utils";

const truncate15 = (s: string) => (s?.length > 15 ? s.slice(0, 15) + "..." : s);

interface CostBreakdownByModelProps {
  data: AnalyticsRow[];
}

export default function CostBreakdownByModel({ data }: CostBreakdownByModelProps) {
  const isMobile = useIsMobile();
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const modelCosts = data.reduce((acc, row) => {
      acc[row.llm_model] = (acc[row.llm_model] || 0) + row.total_cost;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(modelCosts).sort((a, b) => b[1] - a[1]);

    return sorted.map(([model, cost], index) => ({
      model: truncate15(model),
      fullName: model,
      cost,
      fill: chartColors[index % chartColors.length],
    }));
  }, [data, chartColors]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Cost Breakdown by Model</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: isMobile ? 9 : 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${Number(value).toFixed(3)}`}
              />
              <YAxis
                type="category"
                dataKey="model"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: isMobile ? 9 : 11 }}
                tickLine={false}
                axisLine={false}
                width={isMobile ? 60 : 80}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Model
                            </span>
                            <span className="font-bold">{data.fullName}</span>
                            <span className="text-muted-foreground">
                              Cost: ${Number(data.value).toFixed(5)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
