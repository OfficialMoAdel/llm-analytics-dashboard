/**
 * Chart Utilities - Shared utilities for all chart components
 *
 * Provides centralized utilities for:
 * - CSS variable reading
 * - Color transparency handling
 * - Chart theme generation
 * - Common chart options
 */

/**
 * Reads a CSS custom property from the document root
 */
export function cssVar(name: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Converts a color to RGBA with specified alpha transparency
 */
export function toAlpha(color: string, alpha: number = 0.18): string {
  // If color already has alpha, return as is
  if (color.includes('rgba') || color.includes('hsla')) {
    return color;
  }

  // Create canvas context for color conversion
  const canvas = typeof document !== 'undefined'
    ? document.createElement('canvas')
    : null;

  if (!canvas) return color;

  const ctx = canvas.getContext('2d');
  if (!ctx) return color;

  ctx.fillStyle = color;
  const rgb = ctx.fillStyle as string;

  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  return match
    ? `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`
    : color;
}

/**
 * Extended chart color palette (16+ colors for complex charts)
 */
export function getChartColors() {
  const colors = [
    cssVar('--chart-1') || '#3b82f6',
    cssVar('--chart-2') || '#f59e0b',
    cssVar('--chart-3') || '#10b981',
    cssVar('--chart-4') || '#ef4444',
    cssVar('--chart-5') || '#8b5cf6',
    cssVar('--chart-6') || '#ec4899',
    cssVar('--chart-7') || '#14b8a6',
    cssVar('--chart-8') || '#f97316',
    // Extended palette (if defined)
    cssVar('--chart-9') || '#6366f1',
    cssVar('--chart-10') || '#84cc16',
    cssVar('--chart-11') || '#06b6d4',
    cssVar('--chart-12') || '#a855f7',
    cssVar('--chart-13') || '#0ea5e9',
    cssVar('--chart-14') || '#22c55e',
    cssVar('--chart-15') || '#eab308',
    cssVar('--chart-16') || '#fb7185',
  ].filter(Boolean);

  return colors;
}

/**
 * Generates a complete chart theme object from CSS variables
 */
export function createChartTheme() {
  const primary = cssVar('--primary') || '#3b82f6';
  const foreground = cssVar('--foreground') || '#000000';
  const mutedForeground = cssVar('--muted-foreground') || '#666666';

  return {
    // Primary colors
    primary,
    primaryForeground: cssVar('--primary-foreground') || '#ffffff',

    // Background colors
    background: cssVar('--background') || '#ffffff',
    card: cssVar('--card') || '#ffffff',

    // Grid and axis colors
    grid: toAlpha(cssVar('--muted-foreground') || '#666666', 0.2),
    axis: cssVar('--chart-axis') || mutedForeground,
    text: cssVar('--chart-text') || foreground,

    // Chart-specific colors
    chart1: cssVar('--chart-1') || '#3b82f6',
    chart2: cssVar('--chart-2') || '#f59e0b',
    chart3: cssVar('--chart-3') || '#10b981',
    chart4: cssVar('--chart-4') || '#ef4444',
    chart5: cssVar('--chart-5') || '#8b5cf6',

    // Extended palette
    extendedColors: getChartColors(),

    // Helpers
    toAlpha,
    cssVar,
  };
}

/**
 * Default Chart.js options with theme support
 */
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        font: {
          size: 12,
        },
        usePointStyle: true,
        padding: 15,
      },
    },
    tooltip: {
      mode: 'index' as const,
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
      beginAtZero: true,
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

/**
 * Hook for chart theme variables (alternative to useTheme)
 */
export function useChartTheme() {
  return createChartTheme();
}

export default {
  cssVar,
  toAlpha,
  getChartColors,
  createChartTheme,
  defaultChartOptions,
  useChartTheme,
};
