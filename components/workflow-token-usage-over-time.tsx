"use client";

import React, { useMemo, useState } from "react";
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
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { getChartColors } from "@/lib/chart-utils";
import { RechartsLegend } from "@/components/charts";

const truncate20 = (s: string) => (s?.length > 20 ? s.slice(0, 20) + "..." : s);

interface WorkflowTokenUsageOverTimeProps {
  data: AnalyticsRow[];
}

export default function WorkflowTokenUsageOverTime({
  data,
}: WorkflowTokenUsageOverTimeProps) {
  const isMobile = useIsMobile();
  const chartColors = getChartColors();
  
  // ✅ إضافة state للعناصر المخفية
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());

  const chartData = useMemo(() => {
    const validData = data.filter(row => {
      const date = new Date(row.timestamp);
      return !isNaN(date.getTime()) && date.toString() !== "Invalid Date";
    });

    if (!validData || validData.length === 0) {
      return { data: [], workflows: [] };
    }

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

    if (topWorkflows.length === 0) {
      return { data: [], workflows: [] };
    }

    const daily: Record<string, Record<string, number>> = {};
    validData.forEach((row) => {
      const w = row.workflow_name || "Unknown";
      if (!topWorkflows.includes(w)) return;

      const date = new Date(row.timestamp);
      if (isNaN(date.getTime())) return;

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

    if (sortedDates.length === 0) {
      return { data: [], workflows: [] };
    }

    // Transform to Recharts format
    const result = sortedDates.map((date) => {
      const dataPoint: any = { date };
      topWorkflows.forEach((w) => {
        dataPoint[w] = daily[w]?.[date] || 0;
      });
      return dataPoint;
    });

    return {
      data: result,
      workflows: topWorkflows.map((w, i) => ({
        name: w,
        displayName: truncate20(w),
        color: chartColors[i % chartColors.length],
      })),
    };
  }, [data, chartColors]);

  // ✅ معالج الضغط على Legend
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

  // ✅ تصفية الـ workflows المرئية
  const visibleWorkflows = useMemo(() => {
    return chartData.workflows.filter(w => !hiddenItems.has(w.name));
  }, [chartData.workflows, hiddenItems]);

  // ✅ إنشاء payload للـ Legend
  const legendPayload = useMemo(() => {
    return chartData.workflows.map(w => ({
      value: w.displayName,
      color: w.color,
      id: w.name,
    }));
  }, [chartData.workflows]);

  // Show message if no data
  if (!chartData.data || chartData.data.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Workflow Token Usage Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">
            Token Usage Trends for Top 3 Workflows
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col" style={{ minHeight: "450px", height: "450px" }}>
      <CardHeader className="flex-shrink-0">
        <CardTitle>Workflow Token Usage Over Time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Token Usage Trends for Top 3 Workflows
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* ✅ الرسم البياني في الأعلى */}
        <div className="flex-1 min-h-0 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                angle={-45}              // ✅ أضف هنا
                textAnchor="end"         // ✅ أضف هنا
                height={80} 
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => Number(value).toLocaleString()}
              />
              <Tooltip
  cursor={{ fill: 'transparent' }}
  contentStyle={{
    background: "transparent",
    border: "none",
    boxShadow: "none",
  }}
  content={({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <div className="grid gap-2">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            {payload.map((entry, index) => {
              const workflow = visibleWorkflows[index];
              if (!workflow) return null;
              return (
                // ✅ تغيير من flex-col إلى flex (عرضياً)
                <div key={index} className="flex items-center gap-1">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">
                    <span className="font-bold" style={{ color: entry.color }}>
                      {workflow.name}
                    </span>
                    : {Number(entry.value ?? 0).toLocaleString()}
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

              {/* ✅ عرض الخطوط للـ workflows المرئية فقط */}
              {visibleWorkflows.map((workflow) => (
                <Line
                  key={workflow.name}
                  type="monotone"
                  dataKey={workflow.name}
                  stroke={workflow.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  fill={workflow.color}
                  fillOpacity={0.1}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ الأسماء في الأسفل مع خاصية الضغط */}
        {!isMobile && (
          <div className="w-full pt-4 flex justify-center flex-shrink-0">
            <RechartsLegend
              position="bottom"
              onItemClick={handleLegendClick}
              hiddenItems={hiddenItems}
              payload={legendPayload}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
