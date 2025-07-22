import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/knowledge-base/stats/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Errore GET knowledge-base stats:', error)
    return Response.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
} 