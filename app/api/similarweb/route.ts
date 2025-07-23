// Backend API URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

export async function POST(req: Request) {
  try {
    const { websiteUrl } = await req.json()
    
    if (!websiteUrl) {
      return Response.json({ 
        success: false, 
        error: 'URL del sito web richiesto' 
      }, { status: 400 })
    }

    console.log(`Inoltro richiesta analisi traffico al backend: ${websiteUrl}`)

    // Inoltra la richiesta al backend
    const response = await fetch(`${BACKEND_URL}/similarweb/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ websiteUrl }),
      // Timeout esteso per Apify
      signal: AbortSignal.timeout(90000) // 90 secondi
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Errore backend SimilarWeb:', response.status, data)
      return Response.json({ 
        success: false, 
        error: data.error || 'Errore nel backend durante l\'analisi' 
      }, { status: response.status })
    }

    console.log('Dati ricevuti dal backend con successo')
    return Response.json(data)

  } catch (error: any) {
    console.error('Errore chiamata backend SimilarWeb:', error)
    
    if (error.name === 'TimeoutError') {
      return Response.json({ 
        success: false, 
        error: 'Timeout durante l\'analisi del sito web. Riprova tra qualche minuto.' 
      }, { status: 408 })
    }
    
    return Response.json({ 
      success: false, 
      error: 'Errore di connessione con il backend' 
    }, { status: 500 })
  }
} 