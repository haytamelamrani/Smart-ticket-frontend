"use client"
import type React from "react"
import { useEffect, useState, useRef, useMemo } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  MessageSquare,
  Clock,
  Mail,
  CheckCircle2,
  XCircle,
  Pause,
  Headphones,
  Plus,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  UserCheck,
  AlertCircle,
  Star,
  FileText,
  Archive,
  History,
  Calendar,
  Award,
  BookOpen,
  Moon,
  Sun,
} from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Typage des messages
interface MessageDto {
  id: number
  ticketId: number
  content: string
  senderType: string
  senderId: string
  channel: string
  status: string
  timestamp: string
  analysis?: {
    sentiment: string
    complexity: string
    category: string
    confidence: number
    needsHuman: boolean
  }
}

// Typage des tickets
interface TicketWithMessages {
  id: number
  title: string
  description: string
  status: string
  category: string
  priority: string
  type: string
  email: string
  userEmail: string
  assignedTo?: string
  createdAt: string
  etatUpdatedAt?: string
  agentMessages: MessageDto[]
  aiMessages: MessageDto[]
  _forceUpdate?: number
}

// Configuration des catégories avec couleurs atténuées pour l'historique
const categoryConfig = {
  technical: {
    label: "Technique",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    borderColor: "border-emerald-100 dark:border-emerald-800",
    emoji: "🔧",
  },
  account: {
    label: "Compte",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    borderColor: "border-blue-100 dark:border-blue-800",
    emoji: "👤",
  },
  billing: {
    label: "Facturation",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    borderColor: "border-amber-100 dark:border-amber-800",
    emoji: "💳",
  },
  feature: {
    label: "Fonctionnalité",
    color: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
    borderColor: "border-purple-100 dark:border-purple-800",
    emoji: "✨",
  },
  bug: {
    label: "Bug",
    color: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    borderColor: "border-red-100 dark:border-red-800",
    emoji: "🐛",
  },
  other: {
    label: "Autre",
    color: "bg-gray-50 text-gray-700 dark:bg-gray-800/20 dark:text-gray-400",
    borderColor: "border-gray-100 dark:border-gray-700",
    emoji: "📋",
  },
}

// Configuration des priorités avec couleurs atténuées
const priorityConfig = {
  low: { label: "Faible", color: "bg-gray-50 text-gray-600", emoji: "🟢" },
  medium: { label: "Moyenne", color: "bg-amber-50 text-amber-600", emoji: "🟡" },
  high: { label: "Élevée", color: "bg-orange-50 text-orange-600", emoji: "🟠" },
  urgent: { label: "Urgente", color: "bg-red-50 text-red-600", emoji: "🔴" },
}

// Configuration des statuts pour l'historique (non cliquables)
const statusConfig = {
  NOUVEAU: { label: "Nouveau", color: "bg-blue-50 text-blue-600", icon: Plus, clickable: false },
  EN_ATTENTE: { label: "En attente", color: "bg-orange-50 text-orange-600", icon: Pause, clickable: false },
  EN_COURS: { label: "En cours", color: "bg-yellow-50 text-yellow-600", icon: Clock, clickable: false },
  CLOSURE_PENDING: {
    label: "En attente confirmation",
    color: "bg-purple-50 text-purple-600",
    icon: AlertCircle,
    clickable: false,
  },
  EN_ATTENTE_CONFIRMATION: {
    label: "En attente confirmation",
    color: "bg-purple-50 text-purple-600",
    icon: AlertCircle,
    clickable: false,
  },
  CLOS: { label: "Résolu", color: "bg-green-50 text-green-600", icon: CheckCircle2, clickable: false },
  FERME: { label: "Archivé", color: "bg-gray-50 text-gray-600", icon: Archive, clickable: false },
}

// Configuration des types
const typeConfig = {
  incident: { label: "Incident", emoji: "⚠️" },
  request: { label: "Demande", emoji: "📝" },
  complaint: { label: "Réclamation", emoji: "😤" },
  suggestion: { label: "Suggestion", emoji: "💡" },
}

// Fonction pour calculer la durée de traitement
const getResolutionTime = (createdAt: string, etatUpdatedAt: string) => {
  try {
    const created = new Date(createdAt)
    const resolved = new Date(etatUpdatedAt || createdAt)
    if (isNaN(created.getTime()) || isNaN(resolved.getTime())) {
      return "Durée inconnue"
    }
    const diffMs = resolved.getTime() - created.getTime()
    if (diffMs < 0) {
      return "Durée inconnue"
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}j ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}min`
    } else {
      return `${minutes}min`
    }
  } catch (error) {
    console.error("Erreur calcul durée:", error)
    return "Durée inconnue"
  }
}

// Composant pour les étoiles de notation (lecture seule pour l'historique)
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

// Fonction pour toggle l'expansion d'un ticket
const toggleTicketExpansion = (
  ticketId: number,
  setExpandedTickets: React.Dispatch<React.SetStateAction<Set<number>>>,
) => {
  setExpandedTickets((prev) => {
    const newSet = new Set(prev)
    if (newSet.has(ticketId)) {
      newSet.delete(ticketId)
    } else {
      newSet.add(ticketId)
    }
    return newSet
  })
}

export default function TicketHistoryPage() {
  const searchParams = useSearchParams()
  const ticketIdParam = searchParams.get("id")
  const ticketId = ticketIdParam ? Number.parseInt(ticketIdParam) : null
  const [tickets, setTickets] = useState<TicketWithMessages[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<{ [key: number]: "ai" | "agent" }>({})

  // États pour la gestion des rôles
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")

  // États pour la confirmation de relance
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    ticketId: number | null
    rating: number
    feedback: string
  }>({
    open: false,
    ticketId: null,
    rating: 0,
    feedback: "",
  })

  const { theme, setTheme } = useTheme()

  // Refs pour auto-scroll
  const scrollRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const [searchType, setSearchType] = useState<string>("all")

  useEffect(() => {
    // Récupérer le rôle et l'email depuis localStorage
    const role = localStorage.getItem("role") || ""
    const email = localStorage.getItem("email") || ""
    setUserRole(role)
    setUserEmail(email)
    fetchTickets()
  }, [])

  // Filtrage des tickets selon le rôle
  const filteredTickets = useMemo(() => {
    let filtered = tickets

    // Filtrage par rôle
    if (userRole === "CLIENT") {
      filtered = tickets.filter((ticket) => ticket.userEmail === userEmail || ticket.email === userEmail)
    }

    // Filtrage par recherche avec type spécifique
    if (searchTerm) {
      filtered = filtered.filter((ticket) => {
        const searchLower = searchTerm.toLowerCase()
        switch (searchType) {
          case "title":
            return ticket.title.toLowerCase().includes(searchLower)
          case "email":
            return (
              (ticket.userEmail && ticket.userEmail.toLowerCase().includes(searchLower)) ||
              (ticket.email && ticket.email.toLowerCase().includes(searchLower))
            )
          case "description":
            return ticket.description.toLowerCase().includes(searchLower)
          case "all":
          default:
            return (
              ticket.title.toLowerCase().includes(searchLower) ||
              ticket.description.toLowerCase().includes(searchLower) ||
              (ticket.userEmail && ticket.userEmail.toLowerCase().includes(searchLower)) ||
              (ticket.email && ticket.email.toLowerCase().includes(searchLower))
            )
        }
      })
    }

    // Filtrage par catégorie
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((ticket) => ticket.category === selectedCategory)
    }

    // Filtrage par priorité
    if (selectedPriority && selectedPriority !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority === selectedPriority)
    }

    // Filtrage par statut
    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === selectedStatus)
    }

    if (ticketId) {
      filtered = tickets.filter((ticket) => ticket.id === ticketId)
      return filtered
    }

    return filtered
  }, [
    tickets,
    userRole,
    userEmail,
    searchTerm,
    selectedCategory,
    selectedPriority,
    selectedStatus,
    searchType,
    ticketId,
  ])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await axios.get<TicketWithMessages[]>("http://localhost:8080/api/tickets/Historique", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      console.log("🎯 Historique des tickets récupéré :", res.data)
      setTickets(res.data)
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'historique :", error)
      toast.error("Erreur", { description: "Impossible de charger l'historique des tickets" })
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "CLIENT":
        return "👤 Client"
      case "ADMIN":
        return "👑 Administrateur"
      case "AGENT":
        return "🎧 Agent"
      default:
        return "❓ Inconnu"
    }
  }

  const handleReveillerTicket = async () => {
    try {
      await axios.put(`http://localhost:8080/api/tickets/${confirmDialog.ticketId}/reveiller`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      toast.success("Ticket relancé avec succès", {
        description: "Le ticket a été remis en traitement et retiré de l'historique.",
      })
      setConfirmDialog((prev) => ({ ...prev, open: false }))
      // Recharger l'historique pour retirer le ticket relancé
      await fetchTickets()
    } catch (error) {
      toast.error("Erreur lors de la relance", {
        description: "Impossible de relancer le ticket. Veuillez réessayer.",
      })
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-muted-foreground">Chargement de l'historique...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header avec thème historique */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl mb-4 shadow-lg">
            <History className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent mb-2">
            📚 Historique des Tickets
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {userRole === "CLIENT" ? "Vos tickets traités et archivés" : "Historique complet des tickets traités"}
          </p>
          {/* Badge du rôle utilisateur */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant="outline" className="text-sm px-4 py-2 bg-slate-50">
              <Archive className="w-4 h-4 mr-2" />
              {getRoleDisplayName(userRole)}
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-slate-100">
              <Mail className="w-4 h-4 mr-2" />
              {userEmail}
            </Badge>
          </div>
          {/* Toggle mode sombre/clair */}
          <div className="flex items-center justify-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="bg-white/80 dark:bg-gray-800/80"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="ml-2">{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
            </Button>
          </div>
        </div>

        {/* Filtres et recherche pour l'historique */}
        <div className="mb-8 space-y-4">
          {/* Première ligne - Recherche */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-2 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={
                    searchType === "title"
                      ? "Rechercher dans l'historique par titre..."
                      : searchType === "email"
                        ? "Rechercher par email..."
                        : searchType === "description"
                          ? "Rechercher par description..."
                          : "Rechercher dans l'historique..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-48 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Tous les champs
                    </div>
                  </SelectItem>
                  <SelectItem value="title">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Titre uniquement
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email uniquement
                    </div>
                  </SelectItem>
                  <SelectItem value="description">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Description uniquement
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchTickets} variant="outline" size="sm" className="shrink-0 bg-white/80">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser l'historique
            </Button>
          </div>

          {/* Deuxième ligne - Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-white/80">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-200"></div>
                      Toutes les catégories
                    </div>
                  </SelectItem>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{config.emoji}</span>
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-48 bg-white/80">
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-200"></div>
                      Toutes les priorités
                    </div>
                  </SelectItem>
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{config.emoji}</span>
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 bg-white/80">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-200"></div>
                      Tous les statuts
                    </div>
                  </SelectItem>
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
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm bg-slate-100">
                <Archive className="w-3 h-3 mr-1" />
                {filteredTickets.length} ticket{filteredTickets.length > 1 ? "s" : ""} archivé
                {filteredTickets.length > 1 ? "s" : ""}
              </Badge>
              {(searchTerm ||
                (selectedCategory && selectedCategory !== "all") ||
                (selectedPriority && selectedPriority !== "all") ||
                (selectedStatus && selectedStatus !== "all")) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedPriority("all")
                    setSelectedStatus("all")
                    setSearchType("all")
                  }}
                  className="text-xs"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Effacer filtres
                </Button>
              )}
              <Badge variant="outline" className="text-xs bg-white/80">
                <Calendar className="w-3 h-3 mr-1" />
                Tri: Plus ancien → Plus récent
              </Badge>
            </div>
          </div>
        </div>

        {/* Grille des tickets historiques - Style archivé */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => {
            const categoryInfo = categoryConfig[ticket.category as keyof typeof categoryConfig] || categoryConfig.other
            const priorityInfo = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium
            const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.NOUVEAU
            const typeInfo = typeConfig[ticket.type as keyof typeof typeConfig] || typeConfig.request
            const StatusIcon = statusInfo.icon
            const isExpanded = expandedTickets.has(ticket.id)
            const currentTab = activeTab[ticket.id] || "ai"
            const currentMessages = currentTab === "ai" ? ticket.aiMessages : ticket.agentMessages

            return (
              <Card
                key={ticket.id}
                className={`shadow-md hover:shadow-lg transition-all duration-300 border ${categoryInfo.borderColor} bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm cursor-pointer opacity-90 hover:opacity-100`}
                onClick={() => toggleTicketExpansion(ticket.id, setExpandedTickets)}
              >
                <CardHeader className="pb-4">
                  {/* Badge "Archivé" en haut */}
                  <div className="flex items-center justify-center mb-4 p-2 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-700 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Ticket Archivé</span>
                      <Badge variant="outline" className="text-xs bg-slate-50">
                        ID: #{ticket.id}
                      </Badge>
                    </div>
                  </div>

                  {/* Durée de traitement */}
                  <div className="flex items-center justify-center mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-300 mr-2">Traité en:</span>
                      <span className="text-lg font-mono font-bold text-green-800 dark:text-green-200 tracking-wider">
                        {getResolutionTime(ticket.createdAt, ticket.etatUpdatedAt || ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${categoryInfo.color} px-3 py-1 opacity-80`}>
                      <span className="mr-1">{categoryInfo.emoji}</span>
                      {categoryInfo.label}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusInfo.color} px-2 py-1 opacity-80`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-lg leading-tight mb-2 flex items-start gap-2 opacity-90">
                    <span className="text-lg">{typeInfo.emoji}</span>
                    <span className="flex-1">{ticket.title}</span>
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2 opacity-80">{ticket.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Métadonnées avec style historique */}
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <Badge className={`${priorityInfo.color} px-2 py-0.5 text-xs opacity-80`}>
                        <span className="mr-1">{priorityInfo.emoji}</span>
                        {priorityInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground opacity-80">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{ticket.userEmail || ticket.email}</span>
                    </div>
                    {ticket.assignedTo && (
                      <div className="flex items-center gap-1 text-muted-foreground opacity-80">
                        <UserCheck className="w-3 h-3" />
                        <span className="truncate">Traité par: {ticket.assignedTo}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground opacity-80">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">Créé le: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    {ticket.etatUpdatedAt && (
                      <div className="flex items-center gap-1 text-muted-foreground opacity-80">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="truncate">
                          Résolu le: {new Date(ticket.etatUpdatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {/* Bouton de relance pour les tickets clos/fermés */}
                    {(ticket.status === "CLOS" || ticket.status === "FERME") && userRole === "CLIENT" && (
                      <div
                        className="pt-3 border-t border-gray-100 dark:border-gray-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Dialog
                          open={confirmDialog.open && confirmDialog.ticketId === ticket.id}
                          onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                              size="sm"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  ticketId: ticket.id,
                                  rating: 0,
                                  feedback: "",
                                })
                              }
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />🔄 Relancer ce ticket
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-amber-600" />
                                Relancer ce ticket archivé ?
                              </DialogTitle>
                              <DialogDescription>
                                Ce ticket sera remis à l'état <strong>NOUVEAU</strong> et sortira de l'historique. Il
                                sera à nouveau traité par notre équipe de support.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium mb-2 block">
                                  Motif de la relance (optionnel)
                                </Label>
                                <Textarea
                                  id="feedback"
                                  placeholder="Pourquoi souhaitez-vous relancer ce ticket ? (problème non résolu, nouvelle question, etc.)"
                                  value={confirmDialog.feedback}
                                  onChange={(e) => setConfirmDialog((prev) => ({ ...prev, feedback: e.target.value }))}
                                  className="min-h-[80px]"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Cette information aidera notre équipe à mieux comprendre votre demande.
                                </p>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  className="flex-1 bg-transparent"
                                  onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                  onClick={handleReveillerTicket}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Confirmer la relance
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>

                  {/* Messages - Consultation uniquement */}
                  {isExpanded && (
                    <div
                      className="space-y-4 animate-in slide-in-from-top-2 duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Separator />
                      {/* Onglets pour consultation */}
                      <div className="flex gap-2">
                        <Button
                          variant={currentTab === "ai" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab((prev) => ({ ...prev, [ticket.id]: "ai" }))}
                          className={`flex items-center gap-2 opacity-80 ${
                            currentTab === "ai" ? "bg-gradient-to-r from-slate-500 to-gray-500 text-white" : ""
                          }`}
                        >
                          <Bot className="w-4 h-4" />
                          Historique IA ({ticket.aiMessages.length})
                        </Button>
                        <Button
                          variant={currentTab === "agent" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveTab((prev) => ({ ...prev, [ticket.id]: "agent" }))}
                          className={`flex items-center gap-2 opacity-80 ${
                            currentTab === "agent" ? "bg-gradient-to-r from-slate-500 to-gray-500 text-white" : ""
                          }`}
                        >
                          <Headphones className="w-4 h-4" />
                          Historique Agent ({ticket.agentMessages.length})
                        </Button>
                      </div>

                      {/* Zone de messages en lecture seule */}
                      <ScrollArea
                        className="h-64 w-full border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50"
                        ref={(el) => {
                          scrollRefs.current[ticket.id] = el
                        }}
                      >
                        <div className="space-y-4">
                          {currentMessages.length === 0 ? (
                            <div className="text-center py-8">
                              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 text-sm">
                                {currentTab === "ai"
                                  ? "Aucun échange avec l'IA dans cet historique"
                                  : "Aucun échange avec les agents dans cet historique"}
                              </p>
                            </div>
                          ) : (
                            currentMessages.map((message, index) => (
                              <div key={index} className="space-y-2 opacity-90">
                                {message.senderType === "USER" ? (
                                  <div className="flex justify-start">
                                    <div className="max-w-[80%] bg-gradient-to-r from-slate-400 to-slate-500 text-white p-3 rounded-lg rounded-bl-none shadow-sm opacity-90">
                                      <div className="flex items-center gap-2 mb-1">
                                        <User className="w-3 h-3" />
                                        <span className="text-xs font-medium">
                                          {message.senderId === userEmail ? "Vous" : "Client"}
                                        </span>
                                      </div>
                                      <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                                      <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-end">
                                    <div
                                      className={`max-w-[80%] p-3 rounded-lg rounded-br-none shadow-sm opacity-90 ${
                                        currentTab === "ai"
                                          ? "bg-gradient-to-r from-slate-500 to-slate-600 text-white"
                                          : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        {currentTab === "ai" ? (
                                          <>
                                            <Bot className="w-3 h-3" />
                                            <span className="text-xs font-medium">Assistant IA</span>
                                            {message.analysis?.confidence && (
                                              <Badge variant="secondary" className="text-xs bg-white/20">
                                                {Math.round(message.analysis.confidence * 100)}%
                                              </Badge>
                                            )}
                                          </>
                                        ) : (
                                          <>
                                            <Headphones className="w-3 h-3" />
                                            <span className="text-xs font-medium">
                                              {message.senderId === userEmail ? "Vous" : "Support Expert"}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <div className="text-xs whitespace-pre-wrap">{message.content}</div>
                                      <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>

                      {/* Note de consultation */}
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                          <BookOpen className="w-3 h-3" />
                          Consultation de l'historique - Ticket archivé
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Indicateur de messages quand fermé */}
                  {!isExpanded && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-gray-100 dark:border-gray-800 opacity-80">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Bot className="w-3 h-3 text-slate-500" />
                          <span>{ticket.aiMessages.length} IA</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Headphones className="w-3 h-3 text-slate-500" />
                          <span>{ticket.agentMessages.length} Agent</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Cliquer pour consulter l'historique</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun ticket dans l'historique</h3>
            <p className="text-gray-500">
              {searchTerm ||
              (selectedCategory && selectedCategory !== "all") ||
              (selectedPriority && selectedPriority !== "all") ||
              (selectedStatus && selectedStatus !== "all")
                ? "Essayez de modifier vos filtres de recherche"
                : userRole === "CLIENT"
                  ? "Vous n'avez pas encore de tickets archivés"
                  : "Aucun ticket n'a encore été archivé"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
