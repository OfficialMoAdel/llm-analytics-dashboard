"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
import { useMemo } from "react";
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
import { createChartTheme, getChartColors } from "@/lib/chart-utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ToolUsageDistributionProps {
  data: AnalyticsRow[];
}

export default function ToolUsageDistribution({ data }: ToolUsageDistributionProps) {
  const isMobile = useIsMobile();
  const theme = createChartTheme();
  const chartColors = getChartColors();

  const chartData = useMemo(() => {
    const toolTokens = data.reduce(
      (acc, row) => {
        if (row.tool) {
          const tokens = row.input_tokens + row.completion_tokens;
          acc[row.tool] = (acc[row.tool] || 0) + tokens;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(toolTokens).sort((a, b) => b[1] - a[1]);

    return sorted.map(([tool, tokens], index) => ({
      tool,
      tokens,
      fill: chartColors[index % chartColors.length],
    }));
  }, [data, chartColors]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Tool Usage Distribution</CardTitle>
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
                tickFormatter={(value) => Number(value).toLocaleString()}
              />
              <YAxis
                type="category"
                dataKey="tool"
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
                              Tool
                            </span>
                            <span className="font-bold">{data.tool}</span>
                            <span className="text-muted-foreground">
                              Tokens: {Number(data.tokens).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="tokens" radius={[0, 4, 4, 0]}>
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
