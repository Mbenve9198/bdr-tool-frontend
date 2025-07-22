import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

// Mock data per il debug in caso il backend non sia raggiungibile
const mockKnowledgeData = {
  success: true,
  data: [
    {
      _id: "mock1",
      title: "Introduzione a SendCloud",
      category: "funzionalità",
      content: "SendCloud è una piattaforma completa per la gestione delle spedizioni...",
      tags: ["introduzione", "overview"],
      priority: 5,
      isActive: true,
      createdBy: "admin",
      lastUpdated: new Date().toISOString(),
      usage: { views: 10, usedInScripts: 5 }
    },
    {
      _id: "mock2", 
      title: "Tariffe Competitive DHL",
      category: "tariffe-corrieri",
      content: "DHL offre tariffe competitive per spedizioni nazionali e internazionali...",
      tags: ["dhl", "tariffe", "competitive"],
      priority: 4,
      isActive: true,
      createdBy: "admin",
      lastUpdated: new Date().toISOString(),
      usage: { views: 25, usedInScripts: 12 }
    }
  ],
  count: 2
}

export async function GET(request: NextRequest) {
  try {
    console.log('🐛 DEBUG - NODE_ENV:', process.env.NODE_ENV)
    console.log('🐛 DEBUG - BACKEND_URL env var:', process.env.BACKEND_URL) 
    console.log('🐛 DEBUG - BACKEND_URL final:', BACKEND_URL)
    
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const url = `${BACKEND_URL}/knowledge-base${queryString ? `?${queryString}` : ''}`
    
    console.log('🔗 Tentativo connessione backend:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout dopo 10 secondi
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Backend response: ${response.status}`)
    }

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Errore connessione backend:', error)
    
    // In caso di errore, usa mock data per il debug
    console.log('📝 Backend non raggiungibile, usando mock data temporanei')
    console.log('🐛 Errore dettagliato:', error instanceof Error ? error.message : String(error))
    return Response.json(mockKnowledgeData, { status: 200 })
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
      signal: AbortSignal.timeout(10000)
    })

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Errore POST knowledge-base:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Errore salvataggio',
        debug: {
          backend_url: BACKEND_URL,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
} 