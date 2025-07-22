import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

// Backend API URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

export async function POST(req: Request) {
  const { messages, mode, formData } = await req.json()

  let systemPrompt = `Sei un assistente AI specializzato per Business Development Representatives (BDR) di SendCloud. 
  Aiuti i BDR a migliorare le loro performance di vendita fornendo consigli, strategie e contenuti personalizzati.
  
  Hai accesso a una knowledge base completa di SendCloud con informazioni su:
  - Funzionalità e benefici della piattaforma
  - Tariffe corrieri competitive
  - Obiezioni comuni e come gestirle
  - Casi studio e best practices
  - Informazioni sui competitor
  
  Rispondi sempre in italiano e usa un tono professionale ma amichevole.
  Usa emoji quando appropriato per rendere la conversazione più coinvolgente.`

  // Cerca informazioni rilevanti nella knowledge base
  let knowledgeContext = ""
  if (formData?.query || messages.length > 0) {
    try {
      const lastMessage = messages[messages.length - 1]?.content || formData?.query || ""
      
      const response = await fetch(`${BACKEND_URL}/knowledge-base/search/ai?query=${encodeURIComponent(lastMessage)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          knowledgeContext = "\n\nInformazioni dalla Knowledge Base SendCloud:\n" +
            data.data.map((item: any) => `- ${item.title}: ${item.content}`).join('\n')
        }
      }
    } catch (error) {
      console.warn('Errore recupero knowledge base:', error)
    }
  }

  if (mode === "cold-call") {
    systemPrompt += `
    
    MODALITÀ CHIAMATA A FREDDO:
    - Analizza il sito web fornito per identificare pain points e opportunità
    - Genera hook personalizzati per chiamate a freddo usando la knowledge base
    - Fornisci consigli su come gestire obiezioni comuni (usa le risposte dalla knowledge base)
    - Suggerisci tariffe corrieri competitive basate sui dati reali
    - Aiuta a costruire rapport con il prospect
    - Crea script di chiamata strutturati e personalizzati`

    // Se c'è un URL sito web, analizzalo
    if (formData?.website) {
      try {
        const analysisResponse = await fetch(`${BACKEND_URL}/prospects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: formData.companyName || 'Prospect',
            website: formData.website,
            industry: formData.industry || 'E-commerce'
          })
        })
        
        if (analysisResponse.ok) {
          const prospectData = await analysisResponse.json()
          systemPrompt += `\n\nAnalisi del prospect:
          - Azienda: ${formData.companyName || 'N/A'}
          - Sito web: ${formData.website}
          - Settore: ${formData.industry || 'N/A'}
          - Score: ${prospectData.data?.score || 'N/A'}`
        }
      } catch (error) {
        console.warn('Errore analisi prospect:', error)
      }
    }
    
  } else if (mode === "offer-generation") {
    systemPrompt += `
    
    MODALITÀ GENERAZIONE OFFERTA:
    - Crea offerte personalizzate per servizi di spedizione usando tariffe reali della knowledge base
    - Analizza i volumi e le destinazioni per ottimizzare i prezzi
    - Confronta con i prezzi attuali del cliente quando disponibili
    - Suggerisci strategie di pricing competitive
    - Genera template email per presentare l'offerta con tariffe specifiche
    - Usa dati reali sui corrieri e servizi disponibili`

    // Ottieni tariffe reali se disponibili parametri
    if (formData?.destination && formData?.weight) {
      try {
        const ratesResponse = await fetch(`${BACKEND_URL}/rates/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: formData.destination,
            weight: parseFloat(formData.weight) || 2,
            service: formData.service || 'standard'
          })
        })
        
        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json()
          if (ratesData.success && ratesData.data.rates.length > 0) {
            systemPrompt += `\n\nTariffe calcolate per ${formData.destination}:
            ${ratesData.data.rates.map((rate: any) => 
              `- ${rate.carrier} ${rate.service}: €${rate.price} (${rate.estimatedDelivery})`
            ).join('\n')}`
          }
        }
      } catch (error) {
        console.warn('Errore calcolo tariffe:', error)
      }
    }
  }

  // Aggiungi il contesto della knowledge base
  systemPrompt += knowledgeContext

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}
