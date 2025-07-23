"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface ProspectSummary {
  id: string
  companyName: string
  website: string
  industry: string
  size: string
  status: string
  analysisDate: string
  estimatedShipments: number
  estimatedRevenue: number
  lastInteraction: {
    type: string
    date: string
    notes: string
    outcome: string
  } | null
}

interface ProspectDetails {
  basic: {
    id: string
    companyName: string
    website: string
    industry: string
    size: string
    status: string
  }
  businessInfo: any
  websiteAnalysis: any
  interactions: any[]
  similarwebData: any
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<ProspectSummary[]>([])
  const [selectedProspect, setSelectedProspect] = useState<ProspectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    loadProspects()
  }, [])

  const loadProspects = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/similarweb/prospects`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProspects(data.data)
        }
      }
    } catch (error) {
      console.error('Errore caricamento prospect:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProspectDetails = async (id: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/similarweb/prospects/${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSelectedProspect(data.data)
        }
      }
    } catch (error) {
      console.error('Errore caricamento dettagli:', error)
    }
  }

  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = prospect.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prospect.website.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "all" || prospect.status === filter || prospect.size === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    const colors = {
      'nuovo': 'bg-blue-100 text-blue-800',
      'contattato': 'bg-yellow-100 text-yellow-800', 
      'interessato': 'bg-green-100 text-green-800',
      'qualificato': 'bg-purple-100 text-purple-800',
      'proposta': 'bg-orange-100 text-orange-800',
      'chiuso-vinto': 'bg-green-100 text-green-800',
      'chiuso-perso': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getSizeIcon = (size: string) => {
    const icons = {
      'startup': '🌱',
      'piccola': '🏪',
      'media': '🏢',
      'grande': '🏭',
      'enterprise': '🏛️'
    }
    return icons[size as keyof typeof icons] || '🏢'
  }

  const renderProspectDetails = () => {
    if (!selectedProspect || !selectedProspect.similarwebData) return null

    const data = selectedProspect.similarwebData
    const business = selectedProspect.businessInfo

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 {selectedProspect.basic.companyName}
              <Badge variant="secondary">{data.basic?.category || 'Non classificato'}</Badge>
              <Badge className={getStatusColor(selectedProspect.basic.status)}>
                {selectedProspect.basic.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Info Base */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-500">Website</div>
                <div className="text-blue-600">
                  <a href={selectedProspect.basic.website} target="_blank" rel="noopener noreferrer">
                    {selectedProspect.basic.website}
                  </a>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Settore</div>
                <div>{selectedProspect.basic.industry}</div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Dimensione</div>
                <div className="flex items-center gap-1">
                  {getSizeIcon(selectedProspect.basic.size)}
                  {selectedProspect.basic.size}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-500">Data Analisi</div>
                <div>{new Date(selectedProspect.websiteAnalysis.analysisDate).toLocaleDateString()}</div>
              </div>
            </div>

            <Separator />

            {/* Metriche Business */}
            <div>
              <h4 className="font-semibold mb-3">🛒 Stime Business</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-600">Visite Mensili</div>
                  <div className="text-xl font-bold text-blue-600">
                    {business?.estimatedMonthlyVisits?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-600">Ordini Stimati</div>
                  <div className="text-xl font-bold text-green-600">
                    {business?.monthlyOrders?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">Conv: {business?.conversionRate || 'N/A'}%</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-600">Spedizioni</div>
                  <div className="text-xl font-bold text-purple-600">
                    {business?.monthlyShipments?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-600">Fatturato Stimato</div>
                  <div className="text-xl font-bold text-orange-600">
                    €{business?.estimatedMonthlyRevenue?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">AOV: €{business?.averageOrderValue || 'N/A'}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Mercati Geografici */}
            {data.geography?.topCountries && (
              <div>
                <h4 className="font-semibold mb-3">🌍 Mercati Principali</h4>
                <div className="space-y-2">
                  {data.geography.topCountries.slice(0, 5).map((country: any, index: number) => (
                    <div key={country.countryCode} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{country.countryCode}</span>
                        <span className="font-medium">{country.countryName}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-1 max-w-60">
                        <Progress value={country.visitsShare} className="h-2 flex-1" />
                        <span className="text-sm font-medium min-w-fit">{country.visitsShare}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Interazioni */}
            <div>
              <h4 className="font-semibold mb-3">📞 Storico Interazioni</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedProspect.interactions.map((interaction: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{interaction.type}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(interaction.date).toLocaleDateString()}
                        </span>
                      </div>
                      {interaction.outcome && (
                        <Badge className={
                          interaction.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                          interaction.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {interaction.outcome}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm">{interaction.notes}</div>
                    {interaction.nextAction && (
                      <div className="text-xs text-blue-600 mt-1">
                        <strong>Prossima azione:</strong> {interaction.nextAction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <div className="text-lg">Caricamento prospect...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Lista Prospect */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">📋 Prospect Salvati</h1>
            <Link href="/">
              <Button variant="outline" size="sm">← Torna</Button>
            </Link>
          </div>
          
          <Input
            placeholder="Cerca per nome o website..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-3"
          />
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              Tutti ({prospects.length})
            </Button>
            <Button 
              size="sm" 
              variant={filter === "nuovo" ? "default" : "outline"}
              onClick={() => setFilter("nuovo")}
            >
              Nuovi
            </Button>
            <Button 
              size="sm" 
              variant={filter === "enterprise" ? "default" : "outline"}
              onClick={() => setFilter("enterprise")}
            >
              Enterprise
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProspects.map((prospect) => (
            <Card 
              key={prospect.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedProspect?.basic.id === prospect.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => loadProspectDetails(prospect.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-lg">{prospect.companyName}</h3>
                    <div className="text-sm text-gray-500">{prospect.website}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getStatusColor(prospect.status)}>
                      {prospect.status}
                    </Badge>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {getSizeIcon(prospect.size)} {prospect.size}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Spedizioni/mese</div>
                    <div className="font-medium">{prospect.estimatedShipments.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fatturato stimato</div>
                    <div className="font-medium">€{prospect.estimatedRevenue.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Analizzato: {new Date(prospect.analysisDate).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredProspects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <div>Nessun prospect trovato</div>
            </div>
          )}
        </div>
      </div>

      {/* Dettagli Prospect */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedProspect ? (
          renderProspectDetails()
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
              <div className="text-6xl mb-4">👈</div>
              <div className="text-xl mb-2">Seleziona un prospect</div>
              <div>Scegli un prospect dalla lista per vedere tutti i dettagli e dati SimilarWeb</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 