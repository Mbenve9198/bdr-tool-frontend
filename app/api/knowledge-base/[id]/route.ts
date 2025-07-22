import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/knowledge-base/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Errore GET knowledge-base item:', error)
    return Response.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/knowledge-base/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Errore PUT knowledge-base:', error)
    return Response.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/knowledge-base/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Errore DELETE knowledge-base:', error)
    return Response.json(
      { success: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
} 