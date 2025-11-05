/**
 * BaseChart - Generic wrapper for all Chart.js charts
 *
 * Provides a consistent interface for rendering charts with:
 * - Automatic theme application
 * - Common configuration options
 * - Responsive behavior
 * - Consistent styling
 */

"use client";

import React from "react";
import {
  Chart as ChartJS,
  ChartOptions,
  ChartData,
  Plugin,
} from "chart.js";

interface BaseChartProps<TData extends ChartData<any>, TOptions extends ChartOptions<any>> {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'bubble';
  data: TData;
  options?: TOptions;
  plugins?: Plugin[];
  className?: string;
  height?: number;
}

export default function BaseChart<
  TData extends ChartData<any> = ChartData<'line'>,
  TOptions extends ChartOptions<any> = ChartOptions<'line'>
>({
  type,
  data,
  options,
  plugins,
  className,
  height = 300,
}: BaseChartProps<TData, TOptions>) {
  // Import Chart.js component dynamically
  const ChartComponent = React.useMemo(() => {
    switch (type) {
      case 'line':
        return require('react-chartjs-2').Line;
      case 'bar':
        return require('react-chartjs-2').Bar;
      case 'pie':
        return require('react-chartjs-2').Pie;
      case 'doughnut':
        return require('react-chartjs-2').Doughnut;
      case 'radar':
        return require('react-chartjs-2').Radar;
      case 'scatter':
        return require('react-chartjs-2').Scatter;
      case 'bubble':
        return require('react-chartjs-2').Bubble;
      default:
        return require('react-chartjs-2').Line;
    }
  }, [type]);

  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.6)',
        },
      },
    },
  };

  const mergedOptions: TOptions = {
    ...(defaultOptions as any),
    ...(options as any),
  } as TOptions;

  return (
    <div className={className} style={{ height: `${height}px`, width: '100%' }}>
      <ChartComponent data={data} options={mergedOptions} plugins={plugins} />
    </div>
  );
}
