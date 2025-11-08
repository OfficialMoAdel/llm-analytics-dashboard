// في بداية ملف fetch-data.ts

// JavaScript MAX_SAFE_INTEGER constant for reference
const MAX_SAFE_INTEGER = 9007199254740991

export interface AnalyticsRow {
  execution_id: string
  timestamp: string
  workflow_id: string
  workflow_name: string
  llm_model: string
  input_tokens: number
  completion_tokens: number
  input_price: number
  output_price: number
  input_cost: number
  output_cost: number
  total_cost: number
  user_id: string
  time: string
  tool?: string
}
export async function fetchGoogleSheetData(): Promise<AnalyticsRow[]> {
  try {
    // Fetch data from our server-side API route instead of directly from Google Sheets
    const response = await fetch('/api/analytics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const { data } = await response.json()
    const rows: AnalyticsRow[] = []

    if (data.table && data.table.rows) {
      for (let i = 1; i < data.table.rows.length; i++) {
        const row = data.table.rows[i]
        if (!row.c) continue

        const getCellValue = (cell: any, asString = false): any => {
          if (!cell) return asString ? "" : null

          if (cell.f !== undefined && cell.f !== null) {
            const formatted = String(cell.f).trim()
            return asString ? formatted : cell.f
          }

          if (cell.v !== undefined && cell.v !== null) {
            return asString ? String(cell.v) : cell.v
          }

          return asString ? "" : null
        }

        // استخراج timestamp بشكل صحيح
        let timestamp = getCellValue(row.c[1], true) || ""

        // إذا كان فارغاً، جرّب cell.f
        if (!timestamp && row.c[1]) {
          timestamp = row.c[1].f ? String(row.c[1].f).trim() :
                      row.c[1].v ? String(row.c[1].v).trim() : ""
        }

        // استخراج user_id بشكل صحيح (مع دعم الأرقام الكبيرة)
        let user_id_str = ""
        if (row.c[12]) {
          // ✅ إضافة تسجيل لتتبع القيم الكبيرة
          const rawValue = row.c[12]
          if (rawValue && (typeof rawValue.v === 'number' && rawValue.v > MAX_SAFE_INTEGER)) {
            console.log('🔍 Large User ID detected:', {
              original: rawValue.v,
              type: typeof rawValue.v,
              formatted: rawValue.f,
              asString: String(rawValue.v)
            })
          }

          if (row.c[12].f) {
            // استخدام القيمة المُنسقة إذا كانت متوفرة
            user_id_str = String(row.c[12].f).trim()
          } else if (row.c[12].v !== undefined && row.c[12].v !== null) {
            const val = row.c[12].v

            // ✅ معالجة خاصة للأرقام الكبيرة جداً
            // التحقق من أن القيمة رقمية وتتججاوز الحد الآمن في JavaScript
            if (typeof val === 'number' && val > MAX_SAFE_INTEGER) {
              // محاولة استخدام cell.f أولاً للحصول على القيمة الأصلية
              user_id_str = row.c[12].f ? String(row.c[12].f).trim() : String(val).trim()

              console.log('✅ Large User ID processed:', user_id_str)
            } else {
              // للقيم العادية - التأكد من أن user_id دائماً string
              user_id_str = String(val).trim()
            }
          }
        }

        // تنظيف user_id - إزالة القيم غير الصالحة
        if (!user_id_str || user_id_str === "undefined" || user_id_str === "null" || user_id_str === "NaN") {
          user_id_str = ""
        }

        const rowData: AnalyticsRow = {
          execution_id: getCellValue(row.c[0], true),
          timestamp: timestamp,
          workflow_id: getCellValue(row.c[2], true),
          workflow_name: getCellValue(row.c[3], true),
          llm_model: getCellValue(row.c[4], true),
          input_tokens: Number(getCellValue(row.c[5])) || 0,
          completion_tokens: Number(getCellValue(row.c[6])) || 0,
          input_price: Number(getCellValue(row.c[7])) || 0,
          output_price: Number(getCellValue(row.c[8])) || 0,
          input_cost: Number(getCellValue(row.c[9])) || 0,
          output_cost: Number(getCellValue(row.c[10])) || 0,
          total_cost: Number(getCellValue(row.c[11])) || 0,
          user_id: user_id_str,
          time: getCellValue(row.c[13], true),
          tool: getCellValue(row.c[14], true) || undefined,
        }

        rows.push(rowData)
      }
    }

    return rows
  } catch (error) {
    // Generic error message to avoid information disclosure
    console.error('Failed to fetch analytics data')
    return []
  }
}


