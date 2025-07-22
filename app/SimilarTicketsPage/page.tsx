"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Eye,
  BarChart3,
  Layers,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Plus,
  Target,
} from "lucide-react"

type Ticket = {
  id: number
  title: string
  description: string
  etat: string
  category?: string
  priority?: string
  createdAt?: string
  userEmail?: string
  groupId?: number
}

type GroupedTickets = Record<string, Ticket[]>

// Configuration des statuts
const statusConfig = {
  NOUVEAU: { label: "Nouveau", color: "bg-blue-100 text-blue-800", icon: Plus },
  EN_ATTENTE: { label: "En attente", color: "bg-orange-100 text-orange-800", icon: Pause },
  EN_COURS: { label: "En cours", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  CLOS: { label: "Résolu", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  FERME: { label: "Fermé", color: "bg-gray-100 text-gray-800", icon: XCircle },
}

// Configuration des priorités
const priorityConfig = {
  low: { label: "Faible", color: "bg-gray-100 text-gray-700", emoji: "🟢" },
  medium: { label: "Moyenne", color: "bg-amber-100 text-amber-700", emoji: "🟡" },
  high: { label: "Élevée", color: "bg-orange-100 text-orange-700", emoji: "🟠" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-700", emoji: "🔴" },
}

export default function TicketGroupesPage() {
  const [groupes, setGroupes] = useState<GroupedTickets>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [seuil, setSeuil] = useState(0.5)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showAllTickets, setShowAllTickets] = useState(false)

  const fetchGroupedTickets = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`http://localhost:8080/api/tickets/groupes?seuil=${seuil}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setGroupes(res.data)
      toast.success("Groupes de tickets chargés avec succès")
    } catch (error) {
      console.error("❌ Erreur de chargement :", error)
      toast.error("Erreur lors du chargement des tickets groupés")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupedTickets()
  }, [seuil])

  // Filtrer les groupes selon les critères
  const filteredGroups = Object.entries(groupes).filter(([groupId, tickets]) => {
    // Filtrer par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const hasMatchingTicket = tickets.some(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.userEmail?.toLowerCase().includes(searchLower),
      )
      if (!hasMatchingTicket) return false
    }

    // Filtrer par statut
    if (selectedStatus !== "all") {
      const hasMatchingStatus = tickets.some((ticket) => ticket.etat === selectedStatus)
      if (!hasMatchingStatus) return false
    }

    return true
  })

  // Toggle expansion d'un groupe
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  // Afficher tous les tickets d'un groupe
  const showGroupTickets = (groupId: string) => {
    setSelectedGroup(groupId)
    setShowAllTickets(true)
  }

  // Calculer les statistiques d'un groupe
  const getGroupStats = (tickets: Ticket[]) => {
    const stats = {
      total: tickets.length,
      nouveau: tickets.filter((t) => t.etat === "NOUVEAU").length,
      enCours: tickets.filter((t) => t.etat === "EN_COURS").length,
      resolu: tickets.filter((t) => t.etat === "CLOS").length,
      prioriteUrgente: tickets.filter((t) => t.priority === "urgent").length,
    }
    return stats
  }

  // Obtenir la couleur du groupe selon la priorité dominante
  const getGroupColor = (tickets: Ticket[]) => {
    const urgentCount = tickets.filter((t) => t.priority === "urgent").length
    const highCount = tickets.filter((t) => t.priority === "high").length
    const totalCount = tickets.length

    if (urgentCount > totalCount * 0.3) return "border-red-200 bg-red-50"
    if (highCount > totalCount * 0.5) return "border-orange-200 bg-orange-50"
    return "border-blue-200 bg-blue-50"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-muted-foreground">Analyse des similarités en cours...</p>
        </div>
      </div>
    )
  }

  // Vue détaillée d'un groupe
  if (showAllTickets && selectedGroup) {
    const groupTickets = groupes[selectedGroup] || []
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎯 Groupe #{selectedGroup}</h1>
              <p className="text-gray-600 dark:text-gray-300">{groupTickets.length} tickets similaires détectés</p>
            </div>
            <Button onClick={() => setShowAllTickets(false)} variant="outline" className="bg-white/80">
              ← Retour aux groupes
            </Button>
          </div>

          {/* Statistiques du groupe */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(getGroupStats(groupTickets)).map(([key, value]) => (
              <Card key={key} className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Liste détaillée des tickets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groupTickets.map((ticket) => {
              const statusInfo = statusConfig[ticket.etat as keyof typeof statusConfig]
              const StatusIcon = statusInfo?.icon || MessageSquare

              return (
                <Card key={ticket.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          Ticket #{ticket.id}
                        </CardTitle>
                        <CardDescription className="text-sm">{ticket.title}</CardDescription>
                      </div>
                      <Badge className={statusInfo?.color || "bg-gray-100 text-gray-800"}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo?.label || ticket.etat}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{ticket.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{ticket.userEmail}</span>
                      {ticket.createdAt && <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            🎯 Groupes de Tickets Similaires
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Analyse intelligente des tickets par similarité de contenu
          </p>
        </div>

        {/* Contrôles et filtres */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher dans les groupes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>

            {/* Filtre par statut */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48 bg-white/80">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Seuil de similarité */}
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Seuil:</Label>
              <Select value={seuil.toString()} onValueChange={(value) => setSeuil(Number.parseFloat(value))}>
                <SelectTrigger className="w-24 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.3">30%</SelectItem>
                  <SelectItem value="0.5">50%</SelectItem>
                  <SelectItem value="0.7">70%</SelectItem>
                  <SelectItem value="0.9">90%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchGroupedTickets} variant="outline" className="bg-white/80">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Groupes détectés</p>
                    <p className="text-2xl font-bold text-blue-600">{Object.keys(groupes).length}</p>
                  </div>
                  <Layers className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total tickets</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Object.values(groupes).reduce((acc, tickets) => acc + tickets.length, 0)}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Seuil actuel</p>
                    <p className="text-2xl font-bold text-purple-600">{Math.round(seuil * 100)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Groupes ouverts</p>
                    <p className="text-2xl font-bold text-orange-600">{expandedGroups.size}</p>
                  </div>
                  <Eye className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Boutons de contrôle global */}
        <div className="mb-6 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allGroups = Object.keys(groupes)
              if (expandedGroups.size === allGroups.length) {
                setExpandedGroups(new Set())
              } else {
                setExpandedGroups(new Set(allGroups))
              }
            }}
            className="bg-white/80"
          >
            {expandedGroups.size === Object.keys(groupes).length ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Fermer tout
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Ouvrir tout
              </>
            )}
          </Button>
        </div>

        {/* Groupes de tickets */}
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun groupe trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedStatus !== "all"
                    ? "Essayez de modifier vos filtres de recherche"
                    : "Aucun ticket similaire détecté avec le seuil actuel"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map(([groupId, tickets]) => {
              const isExpanded = expandedGroups.has(groupId)
              const stats = getGroupStats(tickets)
              const groupColor = getGroupColor(tickets)

              return (
                <Collapsible key={groupId} open={isExpanded} onOpenChange={() => toggleGroup(groupId)}>
                  <Card className={`${groupColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300`}>
                    {/* Header du groupe */}
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-white/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-xl text-gray-900">🎯 Groupe #{groupId}</CardTitle>
                              <CardDescription className="text-gray-600">
                                {tickets.length} tickets similaires • {stats.resolu} résolus • {stats.prioriteUrgente}{" "}
                                urgents
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-white/80">
                              {tickets.length} tickets
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                showGroupTickets(groupId)
                              }}
                              className="bg-white/80"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Voir tout
                            </Button>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    {/* Contenu du groupe */}
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />

                        {/* Statistiques du groupe */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                          <div className="bg-white/60 p-3 rounded-lg text-center">
                            <p className="text-xs text-gray-600">Total</p>
                            <p className="text-lg font-bold text-blue-600">{stats.total}</p>
                          </div>
                          <div className="bg-white/60 p-3 rounded-lg text-center">
                            <p className="text-xs text-gray-600">Nouveaux</p>
                            <p className="text-lg font-bold text-blue-600">{stats.nouveau}</p>
                          </div>
                          <div className="bg-white/60 p-3 rounded-lg text-center">
                            <p className="text-xs text-gray-600">En cours</p>
                            <p className="text-lg font-bold text-yellow-600">{stats.enCours}</p>
                          </div>
                          <div className="bg-white/60 p-3 rounded-lg text-center">
                            <p className="text-xs text-gray-600">Résolus</p>
                            <p className="text-lg font-bold text-green-600">{stats.resolu}</p>
                          </div>
                          <div className="bg-white/60 p-3 rounded-lg text-center">
                            <p className="text-xs text-gray-600">Urgents</p>
                            <p className="text-lg font-bold text-red-600">{stats.prioriteUrgente}</p>
                          </div>
                        </div>

                        {/* Aperçu des tickets (limité à 3) */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 mb-3">Aperçu des tickets :</h4>
                          {tickets.slice(0, 3).map((ticket) => {
                            const statusInfo = statusConfig[ticket.etat as keyof typeof statusConfig]
                            const StatusIcon = statusInfo?.icon || MessageSquare

                            return (
                              <div
                                key={ticket.id}
                                className="bg-white/80 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-gray-900 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    Ticket #{ticket.id}
                                  </h5>
                                  <Badge
                                    className={statusInfo?.color || "bg-gray-100 text-gray-800"}
                                    variant="secondary"
                                  >
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusInfo?.label || ticket.etat}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium text-gray-800 mb-1">{ticket.title}</p>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{ticket.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>{ticket.userEmail}</span>
                                  {ticket.createdAt && <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>}
                                </div>
                              </div>
                            )
                          })}

                          {tickets.length > 3 && (
                            <div className="text-center pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => showGroupTickets(groupId)}
                                className="bg-white/80"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir les {tickets.length - 3} autres tickets
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
