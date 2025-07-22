"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type ChatMode = "cold-call" | "offer-generation" | null

interface ColdCallForm {
  websiteUrl: string
}

interface OfferForm {
  websiteUrl: string
  product: string
  domesticShipments: string
  internationalShipments: string
  countries: string
  currentPrices: string
  weightRanges: string
}

export default function SendCloudBDRChat() {
  const [chatMode, setChatMode] = useState<ChatMode>(null)
  const [coldCallForm, setColdCallForm] = useState<ColdCallForm>({ websiteUrl: "" })
  const [offerForm, setOfferForm] = useState<OfferForm>({
    websiteUrl: "",
    product: "",
    domesticShipments: "",
    internationalShipments: "",
    countries: "",
    currentPrices: "",
    weightRanges: "",
  })
  const [showColdCallForm, setShowColdCallForm] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      mode: chatMode,
      formData: chatMode === "cold-call" ? coldCallForm : offerForm,
    },
  })

  const handleModeSelect = (mode: ChatMode) => {
    setChatMode(mode)
    if (mode === "cold-call") {
      setShowColdCallForm(true)
    } else if (mode === "offer-generation") {
      setShowOfferForm(true)
    }
  }

  const handleColdCallSubmit = async () => {
    if (!coldCallForm.websiteUrl) return

    setShowColdCallForm(false)
    // Simulate sending to Perplexity and starting conversation
    const syntheticEvent = {
      preventDefault: () => {},
      target: {
        elements: {
          prompt: { value: `Analizza il sito ${coldCallForm.websiteUrl} e genera un hook per chiamata a freddo` },
        },
      },
    } as any

    handleSubmit(syntheticEvent)
  }

  const handleOfferSubmit = async () => {
    if (!offerForm.websiteUrl || !offerForm.product) return

    setShowOfferForm(false)
    let prompt = `Crea offerta migliore per ecommerce ${offerForm.websiteUrl}, che vende ${offerForm.product}, con ${offerForm.domesticShipments} spedizioni in Italia`

    if (Number.parseInt(offerForm.internationalShipments) > 0) {
      prompt += ` e ${offerForm.internationalShipments} spedizioni all'estero`
      if (offerForm.countries) {
        prompt += ` verso: ${offerForm.countries}`
      }
    }

    if (offerForm.currentPrices) {
      prompt += `. Prezzi attuali: ${offerForm.currentPrices}`
    }

    if (offerForm.weightRanges) {
      prompt += `. Fasce di peso richieste: ${offerForm.weightRanges}`
    }

    const syntheticEvent = {
      preventDefault: () => {},
      target: { elements: { prompt: { value: prompt } } },
    } as any

    handleSubmit(syntheticEvent)
  }

  const resetChat = () => {
    setChatMode(null)
    setShowColdCallForm(false)
    setShowOfferForm(false)
    setColdCallForm({ websiteUrl: "" })
    setOfferForm({
      websiteUrl: "",
      product: "",
      domesticShipments: "",
      internationalShipments: "",
      countries: "",
      currentPrices: "",
      weightRanges: "",
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={resetChat}
            className="w-full justify-start text-left font-normal bg-transparent"
            variant="outline"
          >
            ➕ Nuova Conversazione
          </Button>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                Tutti
              </Badge>
              <Badge variant="outline" className="text-xs">
                Preferiti
              </Badge>
              <Badge variant="outline" className="text-xs">
                Recenti
              </Badge>
            </div>

            {messages.length > 0 && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100">
                  <div className="font-medium text-sm">
                    {chatMode === "cold-call" ? "📞 Chiamata a Freddo" : "💰 Offerta Corrieri"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{messages[0]?.content.substring(0, 50)}...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-left font-normal h-10"
            onClick={() => window.open('/knowledge-base', '_blank')}
          >
            📚 Knowledge Base
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">🔗 Condividi con un collega</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            {!chatMode && (
              <div className="text-center space-y-8">
                <div>
                  <h1 className="text-4xl font-light text-gray-900 mb-2">Ciao! Sono il tuo assistente BDR 👋</h1>
                  <p className="text-xl text-gray-500">Come posso aiutarti oggi?</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Scegli una modalità o scrivi la tua domanda..."
                      className="h-14 text-lg pl-4 pr-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      readOnly
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
                      <span className="text-gray-400">📎</span>
                      <span className="text-gray-400">😊</span>
                      <span className="text-gray-400">🎤</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                      onClick={() => handleModeSelect("cold-call")}
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-gray-200 hover:border-blue-500 hover:text-blue-600"
                    >
                      📞 Chiamata a Freddo
                    </Button>
                    <Button
                      onClick={() => handleModeSelect("offer-generation")}
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-gray-200 hover:border-blue-500 hover:text-blue-600"
                    >
                      💰 Offerta Corrieri
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-gray-200 hover:border-blue-500 hover:text-blue-600 bg-transparent"
                      onClick={() => window.open('/knowledge-base', '_blank')}
                    >
                      📚 Knowledge Base
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-gray-200 hover:border-blue-500 hover:text-blue-600 bg-transparent"
                    >
                      📊 Analisi Competitor
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-gray-200 hover:border-blue-500 hover:text-blue-600 bg-transparent"
                    >
                      ✉️ Email Template
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Cold Call Form */}
            {showColdCallForm && (
              <Card className="max-w-lg mx-auto">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">📞 Modalità Chiamata a Freddo</h2>
                      <p className="text-gray-600 text-sm">
                        Inserisci l'URL del sito web del prospect per generare un hook personalizzato
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">URL del sito web *</label>
                      <Input
                        type="url"
                        placeholder="https://esempio.com"
                        value={coldCallForm.websiteUrl}
                        onChange={(e) => setColdCallForm({ websiteUrl: e.target.value })}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleColdCallSubmit} disabled={!coldCallForm.websiteUrl} className="flex-1">
                        🚀 Genera Hook
                      </Button>
                      <Button variant="outline" onClick={() => setShowColdCallForm(false)}>
                        Annulla
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Offer Generation Form */}
            {showOfferForm && (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">💰 Generazione Offerta Corrieri</h2>
                      <p className="text-gray-600 text-sm">Compila i campi per generare un'offerta personalizzata</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL Ecommerce *</label>
                        <Input
                          type="url"
                          placeholder="https://shop.esempio.com"
                          value={offerForm.websiteUrl}
                          onChange={(e) => setOfferForm({ ...offerForm, websiteUrl: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prodotto venduto *</label>
                        <Input
                          placeholder="es. abbigliamento, elettronica..."
                          value={offerForm.product}
                          onChange={(e) => setOfferForm({ ...offerForm, product: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spedizioni Italia/mese</label>
                        <Input
                          type="number"
                          placeholder="es. 500"
                          value={offerForm.domesticShipments}
                          onChange={(e) => setOfferForm({ ...offerForm, domesticShipments: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spedizioni Estero/mese</label>
                        <Input
                          type="number"
                          placeholder="es. 100"
                          value={offerForm.internationalShipments}
                          onChange={(e) => setOfferForm({ ...offerForm, internationalShipments: e.target.value })}
                        />
                      </div>
                    </div>

                    {Number.parseInt(offerForm.internationalShipments) > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paesi di destinazione</label>
                        <Input
                          placeholder="es. Francia, Germania, Spagna..."
                          value={offerForm.countries}
                          onChange={(e) => setOfferForm({ ...offerForm, countries: e.target.value })}
                        />
                      </div>
                    )}

                    <Separator />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prezzi attuali (opzionale)</label>
                      <Textarea
                        placeholder="es. Attualmente paga €5 per spedizione standard, €12 per express..."
                        value={offerForm.currentPrices}
                        onChange={(e) => setOfferForm({ ...offerForm, currentPrices: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fasce di peso richieste (opzionale)
                      </label>
                      <Input
                        placeholder="es. 0-1kg, 1-5kg, 5-10kg..."
                        value={offerForm.weightRanges}
                        onChange={(e) => setOfferForm({ ...offerForm, weightRanges: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleOfferSubmit}
                        disabled={!offerForm.websiteUrl || !offerForm.product}
                        className="flex-1"
                      >
                        🎯 Genera Offerta
                      </Button>
                      <Button variant="outline" onClick={() => setShowOfferForm(false)}>
                        Annulla
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chat Messages */}
            {messages.length > 0 && !showColdCallForm && !showOfferForm && (
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="secondary" className="text-sm">
                    {chatMode === "cold-call" ? "📞 Chiamata a Freddo" : "💰 Offerta Corrieri"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={resetChat}>
                    🔄 Reset
                  </Button>
                </div>

                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-3xl p-4 rounded-2xl ${
                          message.role === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse">🤖</div>
                          <span className="text-gray-500">Sto elaborando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="relative">
                    <Input
                      name="prompt"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Continua la conversazione..."
                      className="h-14 text-lg pl-4 pr-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      disabled={isLoading || !input.trim()}
                    >
                      ➤
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
