"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsRow } from "@/lib/fetch-data";
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
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

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
        <CardTitle>Token Usage by Model</CardTitle>
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
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="grid gap-2">
                            <span className="font-bold">{data.name}</span>
                            <span className="text-muted-foreground">
                              Tokens: {Number(data.value || 0).toLocaleString()} ({data.percentage}%)
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
});
