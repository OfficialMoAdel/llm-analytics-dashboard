import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get credentials from environment variables
    const sheetId = process.env.GOOGLE_SHEET_ID
    const gid = process.env.GOOGLE_SHEET_GID

    // Validate environment variables are set
    if (!sheetId || !gid) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing environment variables' },
        { status: 500 }
      )
    }

    // Construct Google Sheets API URL
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`

    // Fetch data from Google Sheets on the server side
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data from Google Sheets' },
        { status: 502 }
      )
    }

    const text = await response.text()

    // Parse the Google Sheets response format
    // The response is in the format: google.visualization.Query.setResponse({...})
    const jsonString = text.substring(47, text.length - 2)
    const json = JSON.parse(jsonString)

    // Return the data to the client
    return NextResponse.json({ data: json })
  } catch (error) {
    // Generic error message to avoid information disclosure
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
