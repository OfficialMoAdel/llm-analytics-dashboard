// hooks/use-chart-colors.ts
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

// قراءة متغير CSS من :root
const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// تحويل لون إلى نسخة بشفافية لاستخدامها كـ background
const toAlpha = (color: string, a = 0.15) => {
  const ctx = document.createElement("canvas").getContext("2d")!
  ctx.fillStyle = color // يقبل hsl()/rgb()/hex
  const computed = ctx.fillStyle as string // يتحول إلى rgb(r,g,b)
  const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  return m ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})` : color
}

// اختصار لقصّ النصوص الطويلة في محاور/ليجند
export const truncate20 = (s: string, n = 20) =>
  s.length > n ? s.slice(0, n - 1) + "…" : s

export function useChartColors() {
  const { theme } = useTheme()

  const [colors, setColors] = useState({
    text: "#e5e7eb",   // افتراضي آمن
    axis: "rgba(148,163,184,0.6)",
    grid: "rgba(148,163,184,0.25)",
    border: "#0f172a",
    series: [] as string[],
    alpha: [] as string[],
  })

  useEffect(() => {
    // اجلب من متغيرات CSS (المعرّفة في app/globals.css)
    const text = cssVar("--chart-text") || cssVar("--foreground") || "#e5e7eb"
    const axis = cssVar("--chart-axis") || "rgba(148,163,184,0.6)"
    const grid = cssVar("--chart-grid") || "rgba(148,163,184,0.25)"
    const border = cssVar("--chart-border") || cssVar("--card") || "#0f172a"

    const series = [
      cssVar("--chart-1"),
      cssVar("--chart-2"),
      cssVar("--chart-3"),
      cssVar("--chart-4"),
      cssVar("--chart-5"),
      cssVar("--chart-6"),
      cssVar("--chart-7"),
      cssVar("--chart-8"),
    ].filter(Boolean)

    const alpha = series.map((c) => toAlpha(c, 0.18))

    setColors({
      text,
      axis,
      grid,
      border,
      series,
      alpha,
    })
  }, [theme])

  return colors
}
