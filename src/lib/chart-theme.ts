/**
 * Chart Theme Utilities
 *
 * Provides helper functions for applying consistent theme colors with opacity
 * to Chart.js components. All colors are derived from CSS custom properties
 * defined in app/globals.css for seamless light/dark mode support.
 */

import { cssVar, toAlpha } from './chart-utils';

/**
 * TypeScript interface for chart theme configuration
 */
export interface ChartTheme {
  // Primary colors
  primary: string;
  primaryFill: string;
  primaryStroke: string;

  // Grid and axis colors
  grid: string;
  axis: string;
  text: string;

  // Chart palette
  chartColors: string[];

  // Typography
  fontSize: {
    small: number;
    medium: number;
    large: number;
  };

  // Utility functions
  toRgba: (hslWithOpacity: string) => string;
  cssVar: (name: string) => string;
  toAlpha: (color: string, alpha: number) => string;
}

/**
 * Pre-configured light theme
 */
export const lightTheme: ChartTheme = {
  primary: 'hsl(151.3274 66.8639% 66.8627%)',
  primaryFill: 'hsl(151.3274 66.8639% 66.8627% / 0.25)',
  primaryStroke: 'hsl(151.3274 66.8639% 66.8627% / 1)',
  grid: 'hsl(0 0% 89.8039% / 0.2)',
  axis: 'hsl(0 0% 12.5490%)',
  text: 'hsl(0 0% 32.1569%)',
  chartColors: [
    'hsl(151.3274 66.8639% 66.8627%)',
    'hsl(217.2193 91.2195% 59.8039%)',
    'hsl(258.3117 89.5349% 66.2745%)',
    'hsl(37.6923 92.1260% 50.1961%)',
    'hsl(160.1183 84.0796% 39.4118%)',
  ],
  fontSize: {
    small: 10,
    medium: 12,
    large: 14,
  },
  toRgba: () => 'rgba(0, 0, 0, 1)',
  cssVar: () => '',
  toAlpha: () => 'rgba(0, 0, 0, 0.5)',
};

/**
 * Pre-configured dark theme
 */
export const darkTheme: ChartTheme = {
  primary: 'hsl(141.8919 69.1589% 58.0392%)',
  primaryFill: 'hsl(141.8919 69.1589% 58.0392% / 0.25)',
  primaryStroke: 'hsl(141.8919 69.1589% 58.0392% / 1)',
  grid: 'hsl(0 0% 100% / 0.1)',
  axis: 'hsl(0 0% 63.5294%)',
  text: 'hsl(0 0% 66.2745%)',
  chartColors: [
    'hsl(141.8919 69.1589% 58.0392%)',
    'hsl(213.1169 93.9024% 67.8431%)',
    'hsl(255.1351 91.7355% 76.2745%)',
    'hsl(43.2558 96.4126% 56.2745%)',
    'hsl(172.4551 66.0079% 50.3922%)',
  ],
  fontSize: {
    small: 10,
    medium: 12,
    large: 14,
  },
  toRgba: () => 'rgba(255, 255, 255, 1)',
  cssVar: () => '',
  toAlpha: () => 'rgba(255, 255, 255, 0.5)',
};

/**
 * Converts HSL color with opacity to rgba format for Chart.js compatibility
 * @param hslColor - HSL color string (e.g., "151.3274 66.8639% 66.8627% / 0.25")
 * @returns RGBA color string
 */
export function hsla(hslColor: string): string {
  // Parse HSL with opacity
  const parts = hslColor.split('/');
  const hsl = parts[0].trim().split(' ');
  const opacity = parts[1] ? parseFloat(parts[1].trim()) : 1;

  const h = parseFloat(hsl[0]);
  const s = parseFloat(hsl[1]) / 100;
  const l = parseFloat(hsl[2]) / 100;

  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Gets chart theme colors with proper opacity for Chart.js
 */
export function getChartTheme() {
  const primary = cssVar('--primary');
  const chartGrid = cssVar('--chart-grid');
  const chartFill = cssVar('--chart-fill');
  const chartStroke = cssVar('--chart-stroke');
  const chartAxis = cssVar('--chart-axis');
  const chartText = cssVar('--chart-text');
  const mutedForeground = cssVar('--muted-foreground');

  return {
    // Primary colors
    primary,
    primaryFill: chartFill || hsla(`${primary} / 0.25`),
    primaryStroke: chartStroke || hsla(`${primary} / 1`),

    // Grid and axis colors
    grid: chartGrid || hsla(`${mutedForeground} / 0.2`),
    axis: chartAxis || mutedForeground,
    text: chartText || mutedForeground,

    // Utility for converting any HSL with opacity
    toRgba: (hslWithOpacity: string) => hsla(hslWithOpacity),
  };
}

/**
 * Filters out invalid dates from chart data
 * @param data - Array of data points with date properties
 * @param dateField - The field name containing the date (default: 'date')
 * @returns Filtered data with valid dates only
 */
export function filterValidDates<T extends Record<string, any>>(
  data: T[],
  dateField: string = 'date'
): T[] {
  return data.filter(item => {
    const dateValue = item[dateField];
    if (!dateValue) return false;

    // Try to create a valid Date object
    const date = new Date(dateValue);

    // Check if the date is valid
    return !isNaN(date.getTime()) && date.toString() !== 'Invalid Date';
  });
}

/**
 * Creates a consistent area chart configuration with proper theming
 */
export function createAreaChartConfig(
  data: any[],
  options: any = {}
) {
  const theme = getChartTheme();

  return {
    type: 'line' as const,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            color: theme.text,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            color: theme.grid,
            drawBorder: false,
          },
          ticks: {
            color: theme.text,
          },
        },
        y: {
          grid: {
            color: theme.grid,
            drawBorder: false,
          },
          ticks: {
            color: theme.text,
          },
        },
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2,
        },
        point: {
          radius: 3,
          hoverRadius: 5,
        },
      },
      ...options,
    },
    plugins: [],
  };
}

/**
 * Default export with all utilities
 */
export default {
  getChartTheme,
  hsla,
  toAlpha,
  filterValidDates,
  createAreaChartConfig,
  lightTheme,
  darkTheme,
};
