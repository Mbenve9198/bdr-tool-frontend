import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

// Mock stats per il debug
const mockStatsData = {
  success: true,
  data: {
    totalItems: 2,
    categorieStats: [
      { _id: "funzionalità", count: 1, totalViews: 10, totalUsage: 5 },
      { _id: "tariffe-corrieri", count: 1, totalViews: 25, totalUsage: 12 }
    ],
    recentItems: [
      { _id: "mock1", title: "Introduzione a SendCloud", category: "funzionalità", lastUpdated: new Date().toISOString() },
      { _id: "mock2", title: "Tariffe Competitive DHL", category: "tariffe-corrieri", lastUpdated: new Date().toISOString() }
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🐛 DEBUG STATS - NODE_ENV:', process.env.NODE_ENV)
    console.log('🐛 DEBUG STATS - BACKEND_URL env var:', process.env.BACKEND_URL) 
    console.log('🐛 DEBUG STATS - BACKEND_URL final:', BACKEND_URL)
    console.log('🔗 Tentativo connessione backend stats:', `${BACKEND_URL}/knowledge-base/stats/overview`)
    
    const response = await fetch(`${BACKEND_URL}/knowledge-base/stats/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`Backend response: ${response.status}`)
    }

    const data = await response.json()
    
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('❌ Errore connessione backend stats:', error)
    
    // In caso di errore, usa mock data per il debug
    console.log('📊 Backend stats non raggiungibili, usando mock data temporanei')
    console.log('🐛 Errore stats dettagliato:', error instanceof Error ? error.message : String(error))
    return Response.json(mockStatsData, { status: 200 })
  }
} 