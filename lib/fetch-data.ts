// في بداية ملف fetch-data.ts
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
    const sheetId = "1Mzb4S2hI4nWQn8I7ysU4E-C6V8Uz2zF1R2j2bWe0F0k"
    const gid = "0"
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`

    const response = await fetch(url)
    const text = await response.text()

    // Remove the callback wrapper
    const jsonString = text.substring(47, text.length - 2)
    const json = JSON.parse(jsonString)

    const rows: AnalyticsRow[] = []

    // Parse the Google Sheets response
    if (json.table && json.table.rows) {
      // ← تخطي السطر الأول (index 0) لأنه عناوين الأعمدة
      for (let i = 1; i < json.table.rows.length; i++) {
        const row = json.table.rows[i]
        if (!row.c) continue

        // دالة مساعدة لاستخراج القيمة من الخلية
        const getCellValue = (cell: any, asString = false): any => {
          if (!cell) return asString ? "" : null
          
          // أولوية للقيمة المنسقة (.f) للنصوص والأرقام الكبيرة
          if (cell.f !== undefined && cell.f !== null) {
            return asString ? String(cell.f) : cell.f
          }
          
          // ثم القيمة الخام (.v)
          if (cell.v !== undefined && cell.v !== null) {
            return asString ? String(cell.v) : cell.v
          }
          
          return asString ? "" : null
        }

        const rowData: AnalyticsRow = {
          execution_id: getCellValue(row.c[0], true),
          timestamp: getCellValue(row.c[1], true),
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
          user_id: getCellValue(row.c[12], true),
          time: getCellValue(row.c[13], true),
          tool: getCellValue(row.c[14], true) || undefined,
        }

        rows.push(rowData)
      }
    }

    return rows
  } catch (error) {
    console.error("[v0] Error fetching Google Sheet data:", error)
    return []
  }
}
