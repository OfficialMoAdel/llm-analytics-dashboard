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
      for (const row of json.table.rows) {
        if (!row.c) continue

        const rowData: AnalyticsRow = {
          execution_id: row.c[0]?.v || "",
          timestamp: row.c[1]?.f || row.c[1]?.v || "",
          workflow_id: row.c[2]?.v || "",
          workflow_name: row.c[3]?.v || "",
          llm_model: row.c[4]?.v || "",
          input_tokens: Number(row.c[5]?.v) || 0,
          completion_tokens: Number(row.c[6]?.v) || 0,
          input_price: Number(row.c[7]?.v) || 0,
          output_price: Number(row.c[8]?.v) || 0,
          input_cost: Number(row.c[9]?.v) || 0,
          output_cost: Number(row.c[10]?.v) || 0,
          total_cost: Number(row.c[11]?.v) || 0,
          user_id: row.c[12]?.v || "",
          time: row.c[13]?.v || "",
          tool: row.c[14]?.v || undefined,
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
