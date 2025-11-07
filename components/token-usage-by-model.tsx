"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
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

const MAX_LABEL = 15;
const truncate15 = (s: string) => (s?.length > MAX_LABEL ? s.slice(0, MAX_LABEL) + "..." : s);

interface TokenUsageByModelProps {
  data: AnalyticsRow[];
}

export default React.memo(function TokenUsageByModel({
  data,
}: TokenUsageByModelProps) {
  const isMobile = useIsMobile();
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const modelTokens = data.reduce((acc, row) => {
      const tokens = row.input_tokens + row.completion_tokens;
      acc[row.llm_model] = (acc[row.llm_model] || 0) + tokens;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(modelTokens).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((sum, [, value]) => sum + value, 0);

    return sorted.map(([model, tokens], index) => ({
      name: model,
      displayName: truncate15(model),
      value: tokens,
      fill: chartColors[index % chartColors.length],
      percentage: total ? ((tokens / total) * 100).toFixed(1) : "0.0",
    }));
  }, [data, chartColors]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Token Usage by Model</CardTitle>
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
                            Tokens: {Number(data.value).toLocaleString()} ({data.percentage}%)
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
});
