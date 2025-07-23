export async function POST(req: Request) {
  try {
    const { websiteUrl } = await req.json()
    
    if (!websiteUrl) {
      return Response.json({ 
        success: false, 
        error: 'URL del sito web richiesto' 
      }, { status: 400 })
    }

    // Estrae il dominio dall'URL
    const url = new URL(websiteUrl)
    const domain = url.hostname.replace('www.', '')

    console.log(`Analizzando traffico per: ${domain}`)

    // Verifica che il token Apify sia configurato
    if (!process.env.APIFY_TOKEN) {
      console.error('APIFY_TOKEN non configurato')
      return Response.json({ 
        success: false, 
        error: 'Configurazione mancante: APIFY_TOKEN non impostato' 
      }, { status: 500 })
    }

    const response = await fetch('https://api.apify.com/v2/acts/tri_angle~fast-similarweb-scraper/run-sync-get-dataset-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIFY_TOKEN}`
      },
      body: JSON.stringify({
        urls: [domain],
        maxItems: 1
      })
    })

    if (!response.ok) {
      console.error('Errore Apify API:', response.status, await response.text())
      return Response.json({ 
        success: false, 
        error: 'Errore nel recupero dati SimilarWeb' 
      }, { status: 500 })
    }

    const data = await response.json()
    
    if (!data || data.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Nessun dato trovato per questo sito web' 
      }, { status: 404 })
    }

    const siteData = data[0]
    
    // Estrae i dati rilevanti per il BDR
    const trafficData = {
      url: siteData.url,
      siteName: siteData.name,
      title: siteData.title,
      description: siteData.description,
      category: siteData.category,
      globalRank: siteData.globalRank?.rank,
      countryRank: siteData.countryRank,
      totalVisits: siteData.engagements?.visits,
      timeOnSite: Math.round(siteData.engagements?.timeOnSite / 60), // converti in minuti
      pagePerVisit: Math.round(siteData.engagements?.pagePerVisit * 10) / 10,
      bounceRate: Math.round(siteData.engagements?.bounceRate * 100),
      trafficSources: {
        direct: Math.round(siteData.trafficSources?.direct * 100),
        search: Math.round(siteData.trafficSources?.search * 100),
        social: Math.round(siteData.trafficSources?.social * 100),
        referrals: Math.round(siteData.trafficSources?.referrals * 100),
        paidReferrals: Math.round(siteData.trafficSources?.paidReferrals * 100),
        mail: Math.round(siteData.trafficSources?.mail * 100)
      },
      topCountries: siteData.topCountries?.map((country: any) => ({
        countryCode: country.countryCode,
        countryName: country.countryName,
        visitsShare: Math.round(country.visitsShare * 100),
        estimatedVisits: Math.round((siteData.engagements?.visits || 0) * country.visitsShare)
      })) || [],
      estimatedMonthlyVisits: siteData.estimatedMonthlyVisits,
      scrapedAt: siteData.scrapedAt
    }

    return Response.json({ 
      success: true, 
      data: trafficData 
    })

  } catch (error) {
    console.error('Errore analisi SimilarWeb:', error)
    return Response.json({ 
      success: false, 
      error: 'Errore interno del server' 
    }, { status: 500 })
  }
} 