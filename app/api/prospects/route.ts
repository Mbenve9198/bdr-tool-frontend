import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'https://bdr-tool-backend.onrender.com'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Chiamata GET /api/prospects - recupero lista prospect')
    console.log('🔗 BACKEND_URL:', BACKEND_URL)
    console.log('🌐 Full URL:', `${BACKEND_URL}/api/similarweb/prospects`)
    
    const response = await fetch(`${BACKEND_URL}/api/similarweb/prospects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ Errore backend prospects:', response.status, response.statusText)
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Prospect caricati:', data.success ? data.data?.length || 0 : 'errore')

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Errore API prospects:', error)
    return NextResponse.json(
      { success: false, error: 'Errore caricamento prospect' },
      { status: 500 }
    )
  }
} 