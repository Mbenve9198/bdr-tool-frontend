import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const url = `${BACKEND_URL}/knowledge-base${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Errore GET knowledge-base:', error)
    return Response.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/knowledge-base`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Errore POST knowledge-base:', error)
    return Response.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
} 