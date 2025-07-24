import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'https://bdr-tool-backend.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log(`📄 Chiamata GET /api/prospects/${id} - recupero dettagli prospect`)
    console.log('🔗 BACKEND_URL:', BACKEND_URL)
    console.log('🌐 Full URL:', `${BACKEND_URL}/api/prospects/${id}`)
    
    const response = await fetch(`${BACKEND_URL}/api/prospects/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('❌ Errore backend prospect details:', response.status, response.statusText)
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Dettagli prospect caricati:', data.success ? 'ok' : 'errore')

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Errore API prospect details:', error)
    return NextResponse.json(
      { success: false, error: 'Errore caricamento dettagli prospect' },
      { status: 500 }
    )
  }
} 