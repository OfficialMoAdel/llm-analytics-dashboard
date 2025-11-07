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
} from "recharts";
import { filterValidDates } from "@/lib/chart-theme";

interface TokenUsageOverTimeProps {
  data: AnalyticsRow[];
}

export default function TokenUsageOverTime({ data }: TokenUsageOverTimeProps) {
  const chartData = useMemo(() => {
    // Filter out invalid dates before processing
    const validData = filterValidDates(data, 'timestamp');

    const dailyTokens = validData.reduce((acc, row) => {
      const date = new Date(row.timestamp);
      // Double-check the date is valid after filtering
      if (isNaN(date.getTime()) || date.toString() === 'Invalid Date') {
        return acc;
      }
      const dateStr = date.toLocaleDateString();
      const tokens = row.input_tokens + row.completion_tokens;
      acc[dateStr] = (acc[dateStr] || 0) + tokens;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(dailyTokens).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    return sorted.map(([date, tokens]) => ({
      date,
      tokens,
    }));
  }, [data]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Token Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {label}
                            </span>
                            <span className="font-bold text-muted-foreground">
                              Tokens: {Number(payload[0]?.value ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="hsl(151.3274 66.8639% 66.8627%)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                fill="hsl(151.3274 66.8639% 66.8627%)"
                fillOpacity={0.25}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
