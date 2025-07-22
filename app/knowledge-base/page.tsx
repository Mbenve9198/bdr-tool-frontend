"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface KnowledgeItem {
  _id: string
  title: string
  category: string
  content: string
  tags: string[]
  priority: number
  isActive: boolean
  createdBy: string
  lastUpdated: string
  usage: {
    views: number
    usedInScripts: number
    lastUsed?: string
  }
  carrierInfo?: {
    name: string
    services: Array<{
      service: string
      price: number
      currency: string
      conditions: string
    }>
    zones: Array<{
      zone: string
      countries: string[]
      basePrice: number
      weightMultiplier: number
    }>
  }
}

interface Stats {
  totalItems: number
  categorieStats: Array<{
    _id: string
    count: number
    totalViews: number
    totalUsage: number
  }>
  recentItems: Array<{
    _id: string
    title: string
    category: string
    lastUpdated: string
  }>
}

const categories = [
  'funzionalità',
  'benefici', 
  'pain-points',
  'tariffe-corrieri',
  'casi-studio',
  'competitor',
  'obiezioni-comuni',
  'integrations',
  'prezzi'
]

const categoryEmojis: Record<string, string> = {
  'funzionalità': '⚙️',
  'benefici': '✨',
  'pain-points': '⚠️',
  'tariffe-corrieri': '📦',
  'casi-studio': '📊',
  'competitor': '🥊',
  'obiezioni-comuni': '❓',
  'integrations': '🔗',
  'prezzi': '💰'
}

export default function KnowledgeBasePage() {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    category: "funzionalità",
    content: "",
    tags: "",
    priority: 1,
    isActive: true,
    createdBy: "admin",
    carrierInfo: {
      name: "",
      services: [{ service: "", price: 0, currency: "EUR", conditions: "" }],
      zones: [{ zone: "", countries: [""], basePrice: 0, weightMultiplier: 0 }]
    }
  })

  useEffect(() => {
    loadStats()
    loadKnowledgeItems()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/knowledge-base/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error('Errore caricamento statistiche:', error)
    }
  }

  const loadKnowledgeItems = async () => {
    setLoading(true)
    try {
      let url = '/api/knowledge-base'
      const params = new URLSearchParams()
      
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory)
      if (searchTerm) params.append('search', searchTerm)
      
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setKnowledgeItems(data.data)
      }
    } catch (error) {
      console.error('Errore caricamento knowledge base:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKnowledgeItems()
  }, [selectedCategory, searchTerm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      const url = editingItem ? `/api/knowledge-base/${editingItem._id}` : '/api/knowledge-base'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        resetForm()
        loadKnowledgeItems()
        loadStats()
        setShowForm(false)
      }
    } catch (error) {
      console.error('Errore salvataggio:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content,
      tags: item.tags.join(', '),
      priority: item.priority,
      isActive: item.isActive,
      createdBy: item.createdBy,
      carrierInfo: item.carrierInfo || {
        name: "",
        services: [{ service: "", price: 0, currency: "EUR", conditions: "" }],
        zones: [{ zone: "", countries: [""], basePrice: 0, weightMultiplier: 0 }]
      }
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        loadKnowledgeItems()
        loadStats()
      }
    } catch (error) {
      console.error('Errore eliminazione:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: "funzionalità",
      content: "",
      tags: "",
      priority: 1,
      isActive: true,
      createdBy: "admin",
      carrierInfo: {
        name: "",
        services: [{ service: "", price: 0, currency: "EUR", conditions: "" }],
        zones: [{ zone: "", countries: [""], basePrice: 0, weightMultiplier: 0 }]
      }
    })
    setEditingItem(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light text-gray-900 mb-2">📚 Knowledge Base</h1>
              <p className="text-xl text-gray-500">Gestisci i contenuti per il supporto BDR</p>
            </div>
            <Button 
              onClick={() => setShowForm(true)} 
              className="h-12 px-6 rounded-xl"
            >
              ➕ Aggiungi Contenuto
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="manage">⚙️ Gestione Contenuti</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Contenuti Totali</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                      </div>
                      <div className="text-3xl">📚</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Categorie Attive</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.categorieStats.length}</p>
                      </div>
                      <div className="text-3xl">🏷️</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Visualizzazioni</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.categorieStats.reduce((sum, cat) => sum + cat.totalViews, 0)}
                        </p>
                      </div>
                      <div className="text-3xl">👁️</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Utilizzi in Script</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.categorieStats.reduce((sum, cat) => sum + cat.totalUsage, 0)}
                        </p>
                      </div>
                      <div className="text-3xl">🎯</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Categories Overview */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>📋 Statistiche per Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.categorieStats.map((cat) => (
                      <div key={cat._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{categoryEmojis[cat._id] || '📄'}</span>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{cat._id}</p>
                            <p className="text-sm text-gray-500">{cat.count} contenuti</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{cat.totalViews} visualizzazioni</p>
                          <p className="text-sm text-gray-600">{cat.totalUsage} utilizzi</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Items */}
            {stats && stats.recentItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>🕒 Contenuti Recenti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentItems.map((item) => (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{categoryEmojis[item.category] || '📄'}</span>
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(item.lastUpdated).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="🔍 Cerca contenuti..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Tutte le categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le categorie</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryEmojis[cat]} {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => {setSearchTerm(""); setSelectedCategory("all")}}>
                    🔄 Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {knowledgeItems.map((item) => (
                <Card key={item._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryEmojis[item.category] || '📄'}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                          {item.isActive ? "Attivo" : "Inattivo"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          P{item.priority}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.content}</p>
                    
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>👁️ {item.usage.views} visualizzazioni</span>
                      <span>🎯 {item.usage.usedInScripts} utilizzi</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="flex-1"
                      >
                        ✏️ Modifica
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            🗑️
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare "{item.title}"? Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(item._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {knowledgeItems.length === 0 && !loading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Nessun contenuto trovato</h3>
                  <p className="text-gray-500 mb-6">Inizia aggiungendo il tuo primo contenuto alla knowledge base.</p>
                  <Button onClick={() => setShowForm(true)}>
                    ➕ Aggiungi Primo Contenuto
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editingItem ? "✏️ Modifica Contenuto" : "➕ Aggiungi Contenuto"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titolo *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Titolo del contenuto"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {categoryEmojis[cat]} {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Contenuto *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder="Descrivi il contenuto in dettaglio..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Priorità</Label>
                      <Select value={formData.priority.toString()} onValueChange={(value) => setFormData({...formData, priority: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Bassa</SelectItem>
                          <SelectItem value="2">2 - Media-Bassa</SelectItem>
                          <SelectItem value="3">3 - Media</SelectItem>
                          <SelectItem value="4">4 - Media-Alta</SelectItem>
                          <SelectItem value="5">5 - Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Contenuto attivo</Label>
                  </div>

                  {formData.category === 'tariffe-corrieri' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">📦 Informazioni Corriere</h3>
                      <div>
                        <Label htmlFor="carrierName">Nome Corriere</Label>
                        <Input
                          id="carrierName"
                          value={formData.carrierInfo.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            carrierInfo: {...formData.carrierInfo, name: e.target.value}
                          })}
                          placeholder="es. DHL, UPS, FedEx"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Salvando..." : editingItem ? "💾 Aggiorna" : "💾 Salva"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {setShowForm(false); resetForm()}}
                    >
                      Annulla
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 