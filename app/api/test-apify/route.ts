export async function GET() {
  try {
    const tokenExists = !!process.env.APIFY_TOKEN
    const tokenPrefix = process.env.APIFY_TOKEN ? process.env.APIFY_TOKEN.substring(0, 10) + '...' : 'NON_CONFIGURATO'
    
    return Response.json({
      success: true,
      data: {
        apifyTokenConfigured: tokenExists,
        tokenPrefix: tokenPrefix,
        environment: process.env.NODE_ENV || 'unknown',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Errore test configurazione:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
} 