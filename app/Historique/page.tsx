"use client"
import React from "react"

import { useEffect, useState, useRef, useMemo } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  MessageCircle,
  Timer,
  UserCheck,
  AlertCircle,
  ThumbsUp,
  Star,
  FileText,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

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
  _forceUpdate?: number // Ajout d'une propriété pour forcer le re-render
}

// Configuration des catégories avec couleurs et emojis
const categoryConfig = {
  technical: {
    label: "Technique",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    emoji: "🔧",
  },
  account: {
    label: "Compte",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    emoji: "👤",
  },
  billing: {
    label: "Facturation",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    borderColor: "border-amber-200 dark:border-amber-800",
    emoji: "💳",
  },
  feature: {
    label: "Fonctionnalité",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
    emoji: "✨",
  },
  bug: {
    label: "Bug",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
    emoji: "🐛",
  },
  other: {
    label: "Autre",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    borderColor: "border-gray-200 dark:border-gray-700",
    emoji: "📋",
  },
}

// Configuration des priorités
const priorityConfig = {
  low: { label: "Faible", color: "bg-gray-100 text-gray-800", emoji: "🟢" },
  medium: { label: "Moyenne", color: "bg-amber-100 text-amber-800", emoji: "🟡" },
  high: { label: "Élevée", color: "bg-orange-100 text-orange-800", emoji: "🟠" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800", emoji: "🔴" },
}

// Configuration des statuts
const statusConfig = {
  NOUVEAU: { label: "Nouveau", color: "bg-blue-100 text-blue-800", icon: Plus, clickable: true },
  EN_ATTENTE: { label: "En attente", color: "bg-orange-100 text-orange-800", icon: Pause, clickable: true },
  EN_COURS: { label: "En cours", color: "bg-yellow-100 text-yellow-800", icon: Clock, clickable: true },
  CLOSURE_PENDING: {
    label: "En attente confirmation",
    color: "bg-purple-100 text-purple-800",
    icon: AlertCircle,
    clickable: true,
  },
  EN_ATTENTE_CONFIRMATION: {
    label: "En attente confirmation",
    color: "bg-purple-100 text-purple-800",
    icon: AlertCircle,
    clickable: true,
  },
  CLOS: { label: "Clos", color: "bg-green-100 text-green-800", icon: CheckCircle2, clickable: true },
  FERME: { label: "Fermé", color: "bg-red-100 text-gray-800", icon: XCircle, clickable: true },
}

// Configuration des types
const typeConfig = {
  incident: { label: "Incident", emoji: "⚠️" },
  request: { label: "Demande", emoji: "📝" },
  complaint: { label: "Réclamation", emoji: "😤" },
  suggestion: { label: "Suggestion", emoji: "💡" },
}

// Fonction pour calculer le temps écoulé avec format précis
const getDetailedTimeElapsed = (etatUpdatedAt: string) => {
  try {
    const now = new Date()
    const created = new Date(etatUpdatedAt)
    if (isNaN(now.getTime()) || isNaN(created.getTime())) {
      return "0j:00h:00min:00s"
    }
    const diffMs = now.getTime() - created.getTime()
    if (diffMs < 0) {
      return "0j:00h:00min:00s"
    }
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
    return `${days}j:${hours.toString().padStart(2, "0")}h:${minutes.toString().padStart(2, "0")}min:${seconds.toString().padStart(2, "0")}s`
  } catch (error) {
    console.error("Erreur calcul temps:", error)
    return "0j:00h:00min:00s"
  }
}

// Composant pour les étoiles de notation
const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
}: {
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
          } ${readonly ? "cursor-default" : ""}`}
          onClick={() => !readonly && onRatingChange?.(star)}
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

// Fonction pour obtenir la couleur du deuxième chronomètre selon l'état
const getStatusChronoColor = (status: string) => {
  switch (status) {
    case "EN_COURS":
      return {
        bg: "from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
        border: "border-green-200 dark:border-green-700",
        icon: "text-green-600 dark:text-green-400",
        text: "text-green-800 dark:text-green-200",
      }
    case "EN_ATTENTE":
      return {
        bg: "from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800",
        border: "border-orange-200 dark:border-orange-700",
        icon: "text-orange-600 dark:text-orange-400",
        text: "text-orange-800 dark:text-orange-200",
      }
    case "CLOSURE_PENDING":
    case "EN_ATTENTE_CONFIRMATION":
      return {
        bg: "from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
        border: "border-purple-200 dark:border-purple-700",
        icon: "text-purple-600 dark:text-purple-400",
        text: "text-purple-800 dark:text-purple-200",
      }
    case "CLOS":
      return {
        bg: "from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800",
        border: "border-emerald-200 dark:border-emerald-700",
        icon: "text-emerald-600 dark:text-emerald-400",
        text: "text-emerald-800 dark:text-emerald-200",
      }
    default:
      return {
        bg: "from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800",
        border: "border-gray-200 dark:border-gray-700",
        icon: "text-gray-600 dark:text-gray-400",
        text: "text-gray-800 dark:text-gray-200",
      }
  }
}

export default function AllTicketsPage() {
  const searchParams = useSearchParams()
  const ticketIdParam = searchParams.get("id")
  const ticketId = ticketIdParam ? Number.parseInt(ticketIdParam) : null
  const [tickets, setTickets] = useState<TicketWithMessages[]>([])
  const [filteredTicketsState, setFilteredTicketsState] = useState<TicketWithMessages[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [newMessages, setNewMessages] = useState<{ [key: number]: { ai: string; agent: string } }>({})
  const [sendingMessage, setSendingMessage] = useState<{ [key: number]: { ai: boolean; agent: boolean } }>({})
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<{ [key: number]: "ai" | "agent" }>({})
  const [aiTyping, setAiTyping] = useState<{ [key: number]: boolean }>({})

  // États pour la gestion des rôles
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")

  // États pour la confirmation de clôture
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

  // États pour le formulaire de solution lors de la clôture
  const [solutionDialog, setSolutionDialog] = useState<{
    open: boolean
    ticketId: number | null
    newStatus: string
    solution: string
  }>({
    open: false,
    ticketId: null,
    newStatus: "",
    solution: "",
  })

  // Refs pour auto-scroll
  const scrollRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Timer pour mettre à jour les chronomètres
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [searchType, setSearchType] = useState<string>("all") // "all", "title", "email", "description"

  useEffect(() => {
    // Récupérer le rôle et l'email depuis localStorage
    const role = localStorage.getItem("role") || ""
    const email = localStorage.getItem("email") || ""
    setUserRole(role)
    setUserEmail(email)
    fetchTickets()

    // Mettre à jour seulement les chronomètres toutes les secondes (optimisé)
    timerRef.current = setInterval(() => {
      // Force seulement un re-render léger pour les chronomètres
      setTickets((prev) => prev.map((ticket) => ({ ...ticket, _forceUpdate: Date.now() })))
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
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

  // Auto-scroll vers le bas des conversations
  const scrollToBottom = (ticketId: number) => {
    setTimeout(() => {
      const scrollElement = scrollRefs.current[ticketId]
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }, 100)
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await axios.get<TicketWithMessages[]>("http://localhost:8080/api/tickets/Historique", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      console.log("🎯 Tickets récupérés :", res.data)
      setTickets(res.data)
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des tickets :", error)
      toast.error("Erreur", { description: "Impossible de charger les tickets" })
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour changer le statut d'un ticket avec gestion de la solution
  const updateTicketStatus = async (ticketId: number, newStatus: string) => {
    if (userRole !== "ADMIN" && userRole !== "AGENT") {
      toast.error("Accès refusé", { description: "Vous n'avez pas les droits pour modifier le statut" })
      return
    }

    // Si le nouveau statut est "CLOS", ouvrir le formulaire de solution
    if (newStatus === "CLOS") {
      setSolutionDialog({
        open: true,
        ticketId: ticketId,
        newStatus: newStatus,
        solution: "",
      })
      return
    }

    // Pour les autres statuts, procéder normalement
    await performStatusUpdate(ticketId, newStatus, "")
  }

  // Fonction pour effectuer la mise à jour du statut avec solution
  const performStatusUpdate = async (ticketId: number, newStatus: string, solution: string) => {
    try {
      await axios.post(`http://localhost:8080/api/tickets/${ticketId}/etat`, null, {
        params: {
          nouvelEtat: newStatus,
          userEmail: userEmail,
          ...(solution && { solution: solution }),
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      // Mise à jour optimisée - seulement le ticket concerné
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: newStatus,
                etatUpdatedAt: new Date().toISOString(), // Nouveau chrono commence maintenant
              }
            : ticket,
        ),
      )

      toast.success("Statut mis à jour", {
        description: `Le ticket a été mis à jour vers "${statusConfig[newStatus as keyof typeof statusConfig]?.label}"${
          solution ? " avec solution proposée" : ""
        }`,
      })
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du statut:", error)
      toast.error("Erreur", { description: "Impossible de mettre à jour le statut" })
    }
  }

  // Fonction pour confirmer la clôture avec solution (OPTIONNELLE)
  const confirmClosureWithSolution = async () => {
    if (!solutionDialog.ticketId) {
      toast.error("Erreur", { description: "ID du ticket manquant" })
      return
    }

    // La solution n'est plus obligatoire
    await performStatusUpdate(solutionDialog.ticketId, solutionDialog.newStatus, solutionDialog.solution.trim())

    setSolutionDialog({
      open: false,
      ticketId: null,
      newStatus: "",
      solution: "",
    })
  }

  const handleReveillerTicket = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/tickets/${confirmDialog.ticketId}/reveiller`,
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      toast.success("Ticket relancé avec succès.");
      setConfirmDialog((prev) => ({ ...prev, open: false }));
      // Optionnel : recharger les tickets
    } catch (error) {
      toast.error("Erreur lors de la relance.");
      console.error(error);
    }
  };
  
  // Fonction pour confirmer la clôture (CLIENT uniquement)
  const confirmTicketClosure = async () => {
    if (!confirmDialog.ticketId) return

    try {
      await axios.post(`http://localhost:8080/api/tickets/${confirmDialog.ticketId}/confirmer`, null, {
        params: {
          userEmail: userEmail,
          note: confirmDialog.rating,
          feedback: confirmDialog.feedback || undefined,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      toast.success("Clôture confirmée", {
        description: "Merci pour votre retour ! Le ticket a été fermé.",
      })

      setConfirmDialog({
        open: false,
        ticketId: null,
        rating: 0,
        feedback: "",
      })

      await fetchTickets()
    } catch (error) {
      console.error("❌ Erreur lors de la confirmation:", error)
      toast.error("Erreur", { description: "Impossible de confirmer la clôture" })
    }
  }

  const handleMessageChange = (ticketId: number, channel: "ai" | "agent", value: string) => {
    setNewMessages((prev) => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], [channel]: value },
    }))
  }

  // Fonction améliorée pour envoyer des messages
  const sendMessage = async (ticketId: number, channel: "ai" | "agent") => {
    const message = newMessages[ticketId]?.[channel]
    if (!message?.trim()) return

    setSendingMessage((prev) => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], [channel]: true },
    }))

    try {
      // Pour ADMIN/AGENT, enregistrer comme SYSTEM pour affichage côté opposé
      const senderType = (userRole === "ADMIN" || userRole === "AGENT") && channel === "agent" ? "SYSTEM" : "USER"

      await saveMessage(ticketId, message, senderType, channel)

      if (channel === "ai") {
        // Afficher l'indicateur de frappe pour l'IA
        setAiTyping((prev) => ({ ...prev, [ticketId]: true }))

        const ticket = tickets.find((t) => t.id === ticketId)
        const conversationHistory =
          ticket?.aiMessages.map((msg) => ({
            role: msg.senderType === "USER" ? ("user" as const) : ("assistant" as const),
            content: msg.content,
            timestamp: msg.timestamp,
          })) || []

        const aiResponse = await getEnhancedAIResponse(message, ticket, conversationHistory)
        await saveMessage(ticketId, aiResponse.response, "SYSTEM", channel, aiResponse.analysis)
        setAiTyping((prev) => ({ ...prev, [ticketId]: false }))
      } else if (channel === "agent" && (userRole === "ADMIN" || userRole === "AGENT")) {
        // Message automatique pour confirmer la réception (optionnel)
        // Pas de message automatique, juste l'envoi du message de l'agent
      } else {
        // Pour les clients qui envoient à l'agent
        const confirmationMessage = `📨 **Message reçu et traité !**

Votre demande a été transmise à notre équipe de support.

**Prochaines étapes :**
- ⏱️ Réponse sous 2-4h ouvrées  
- 📧 Notification par email
- 🔍 Analyse de votre demande

Merci pour votre patience ! Un agent va vous contacter rapidement. 🙏✨`

        await saveMessage(ticketId, confirmationMessage, "SYSTEM", channel)
      }

      await fetchTickets()

      // Réinitialiser le champ et scroll
      setNewMessages((prev) => ({
        ...prev,
        [ticketId]: { ...prev[ticketId], [channel]: "" },
      }))

      scrollToBottom(ticketId)
      toast.success("Message envoyé !")
    } catch (error) {
      const err = error as any
      console.error("❌ Erreur envoi message:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack,
      })
      toast.error("Erreur d'envoi du message")
      setAiTyping((prev) => ({ ...prev, [ticketId]: false }))
    } finally {
      setSendingMessage((prev) => ({
        ...prev,
        [ticketId]: { ...prev[ticketId], [channel]: false },
      }))
    }
  }

  const saveMessage = async (
    ticketId: number,
    content: string,
    senderType: string,
    channel: string,
    analysis?: any,
  ) => {
    const senderId = userEmail

    const messageData = {
      ticketId,
      content: content.trim(),
      senderType,
      senderId,
      channel,
      status: "sent",
      timestamp: new Date().toISOString(),
      ...(analysis && { analysis }),
    }

    console.log("📤 Données envoyées à /api/messages :", messageData)

    if (!ticketId || !messageData.content || !senderType || !channel || !senderId) {
      console.error("❌ Champs manquants ou invalides", messageData)
      toast.error("Impossible d'envoyer le message : champ requis manquant.")
      return
    }

    try {
      const response = await axios.post("http://localhost:8080/api/messages", messageData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error: any) {
      console.error("❌ Erreur lors de l'envoi du message :", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      })
      toast.error("Erreur serveur : message non envoyé.")
    }
  }

  // Fonction améliorée pour obtenir une réponse IA
  const getEnhancedAIResponse = async (
    message: string,
    ticket?: TicketWithMessages,
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string; timestamp?: string }>,
  ): Promise<{ response: string; analysis?: any }> => {
    try {
      const response = await fetch("/api/chat-ai-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          ticketContext: ticket
            ? {
                id: ticket.id,
                title: ticket.title,
                description: ticket.description,
                category: ticket.category,
                priority: ticket.priority,
                type: ticket.type,
                status: ticket.status,
              }
            : null,
          conversationHistory,
          userContext: {
            email: userEmail,
          },
        }),
      })

      const data = await response.json()
      return {
        response: data.response || "Désolé, je n'ai pas pu traiter votre demande.",
        analysis: data.analysis,
      }
    } catch (error) {
      console.error("❌ Erreur IA:", error)
      return {
        response: `🤖 Je rencontre actuellement des difficultés techniques, mais je suis là pour vous aider !

Pouvez-vous me donner plus de détails sur votre problème ? Je vais faire de mon mieux pour vous assister.

Si le problème persiste, je peux vous mettre en contact avec un agent humain. 🙏`,
      }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-muted-foreground">Chargement des tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="container mx-auto px-4">
        {/* Header avec informations utilisateur */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gestion des Tickets
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {userRole === "CLIENT" ? "Vos tickets de support" : "Tous les tickets de support"}
          </p>
          {/* Badge du rôle utilisateur */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant="outline" className="text-sm px-4 py-2">
              {getRoleDisplayName(userRole)}
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Mail className="w-4 h-4 mr-2" />
              {userEmail}
            </Badge>
          </div>
        </div>

        {/* Filtres et recherche améliorés */}
        <div className="mb-8 space-y-4">
          {/* Première ligne - Recherche */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex gap-2 items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={
                    searchType === "title"
                      ? "Rechercher par titre..."
                      : searchType === "email"
                        ? "Rechercher par email..."
                        : searchType === "description"
                          ? "Rechercher par description..."
                          : "Rechercher dans tous les champs..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-48">
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
            <Button onClick={fetchTickets} variant="outline" size="sm" className="shrink-0 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>

          {/* Deuxième ligne - Filtres par catégorie, priorité et statut */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
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
              <Badge variant="secondary" className="text-sm">
                {filteredTickets.length} ticket{filteredTickets.length > 1 ? "s" : ""}
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
              <Badge variant="outline" className="text-xs">
                📅 Tri: Plus ancien → Plus récent
              </Badge>
            </div>
          </div>

          {/* Indicateurs de filtres actifs */}
          {(searchTerm ||
            (selectedCategory && selectedCategory !== "all") ||
            (selectedPriority && selectedPriority !== "all") ||
            (selectedStatus && selectedStatus !== "all")) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filtres actifs:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  <Search className="w-3 h-3 mr-1" />
                  {searchType === "all"
                    ? "Recherche"
                    : searchType === "title"
                      ? "Titre"
                      : searchType === "email"
                        ? "Email"
                        : "Description"}
                  : "{searchTerm}"
                </Badge>
              )}
              {selectedCategory && selectedCategory !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {categoryConfig[selectedCategory as keyof typeof categoryConfig]?.emoji}
                  {categoryConfig[selectedCategory as keyof typeof categoryConfig]?.label}
                </Badge>
              )}
              {selectedPriority && selectedPriority !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {priorityConfig[selectedPriority as keyof typeof priorityConfig]?.emoji}
                  {priorityConfig[selectedPriority as keyof typeof priorityConfig]?.label}
                </Badge>
              )}
              {selectedStatus && selectedStatus !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {React.createElement(statusConfig[selectedStatus as keyof typeof statusConfig]?.icon, {
                    className: "w-3 h-3 mr-1",
                  })}
                  {statusConfig[selectedStatus as keyof typeof statusConfig]?.label}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Dialog pour la solution lors de la clôture (OPTIONNELLE) */}
        <Dialog open={solutionDialog.open} onOpenChange={(open) => setSolutionDialog((prev) => ({ ...prev, open }))}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Clôturer le ticket
              </DialogTitle>
              <DialogDescription>
                Vous pouvez optionnellement décrire la solution apportée à ce problème.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="solution" className="text-sm font-medium mb-2 block">
                  Solution proposée (optionnelle)
                </Label>
                <Textarea
                  id="solution"
                  placeholder="Décrivez la solution qui a été apportée au problème..."
                  value={solutionDialog.solution}
                  onChange={(e) => setSolutionDialog((prev) => ({ ...prev, solution: e.target.value }))}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cette solution sera visible par le client si vous la renseignez.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setSolutionDialog((prev) => ({ ...prev, open: false }))}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={confirmClosureWithSolution}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Clôturer {solutionDialog.solution.trim() ? "avec solution" : ""}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Grille des tickets - 3 par ligne */}
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
            const isAiTyping = aiTyping[ticket.id] || false

            // Vérifier si le client peut confirmer la clôture
            const canConfirmClosure =
              userRole === "CLIENT" &&
              (ticket.status === "CLOS" ||
                ticket.status === "CLOSURE_PENDING" ||
                ticket.status === "EN_ATTENTE_CONFIRMATION")

            return (
              <Card
                key={ticket.id}
                className={`shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${categoryInfo.borderColor} bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm cursor-pointer`}
                onClick={() => toggleTicketExpansion(ticket.id, setExpandedTickets)}
              >
                <CardHeader className="pb-4">
                  {/* Compteur de temps en haut */}
                  {/* Chronomètre depuis etatUpdatedAt - avec couleur selon l'état */}
                  {/* Compteur de temps principal - toujours affiché */}
                  <div className="flex items-center justify-center mb-4 p-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-2">Créé il y a:</span>
                      <span className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                        {getDetailedTimeElapsed(ticket.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Chronomètre depuis etatUpdatedAt - SEULEMENT si l'état a été modifié */}
                  {((ticket.etatUpdatedAt && ticket.etatUpdatedAt !== ticket.createdAt) ||
                    ticket.status !== "NOUVEAU") && (
                    <div
                      className={`flex items-center justify-center mb-4 p-3 bg-gradient-to-r ${getStatusChronoColor(ticket.status).bg} rounded-lg border ${getStatusChronoColor(ticket.status).border}`}
                    >
                      <div className="flex items-center gap-2">
                        <Timer className={`w-5 h-5 ${getStatusChronoColor(ticket.status).icon}`} />
                        <span className={`text-sm font-medium ${getStatusChronoColor(ticket.status).text} mr-2`}>
                          {statusConfig[ticket.status as keyof typeof statusConfig]?.label} depuis:
                        </span>
                        <span
                          className={`text-lg font-mono font-bold ${getStatusChronoColor(ticket.status).text} tracking-wider`}
                        >
                          {getDetailedTimeElapsed(
                            ticket.etatUpdatedAt && ticket.etatUpdatedAt !== "null"
                              ? ticket.etatUpdatedAt
                              : ticket.createdAt,
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${categoryInfo.color} px-3 py-1`}>
                      <span className="mr-1">{categoryInfo.emoji}</span>
                      {categoryInfo.label}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {/* Badge de statut cliquable pour ADMIN/AGENT */}
                      {(userRole === "ADMIN" || userRole === "AGENT") && statusInfo.clickable ? (
                        <Select
                          value={ticket.status}
                          onValueChange={(newStatus) => {
                            if (newStatus) updateTicketStatus(ticket.id, newStatus)
                          }}
                        >
                          <SelectTrigger
                            className={`${statusInfo.color} px-2 py-1 h-auto border-0 text-xs font-medium`}
                          >
                            <div className="flex items-center gap-1">
                              <StatusIcon className="w-3 h-3" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
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
                      ) : (
                        <Badge className={`${statusInfo.color} px-2 py-1`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-lg leading-tight mb-2 flex items-start gap-2">
                    <span className="text-lg">{typeInfo.emoji}</span>
                    <span className="flex-1">{ticket.title}</span>
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{ticket.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Métadonnées */}
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <Badge className={`${priorityInfo.color} px-2 py-0.5 text-xs`}>
                        <span className="mr-1">{priorityInfo.emoji}</span>
                        {priorityInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{ticket.userEmail || ticket.email}</span>
                    </div>
                    {ticket.assignedTo && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UserCheck className="w-3 h-3" />
                        <span className="truncate">Assigné à: {ticket.assignedTo}</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton de confirmation de clôture pour CLIENT */}
                  {canConfirmClosure && (
                    <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                      <Dialog
                    open={confirmDialog.open && confirmDialog.ticketId === ticket.id}
                    onOpenChange={(open) =>
                        setConfirmDialog((prev) => ({ ...prev, open }))
                    }
                    >
                    <DialogTrigger asChild>
                        <Button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        onClick={() =>
                            setConfirmDialog({
                            open: true,
                            ticketId: ticket.id,
                            rating: 0,
                            feedback: "",
                            })
                        }
                        >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Relancer ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                        <DialogTitle>Relancer ce ticket ?</DialogTitle>
                        <DialogDescription>
                            Vous allez remettre ce ticket à l'état <strong>NOUVEAU</strong>.
                            Cela indiquera qu'il nécessite une nouvelle intervention.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Commentaire (optionnel)</Label>
                            <Textarea
                            id="feedback"
                            placeholder="Pourquoi relancer ce ticket ?"
                            value={confirmDialog.feedback}
                            onChange={(e) =>
                                setConfirmDialog((prev) => ({ ...prev, feedback: e.target.value }))
                            }
                            className="min-h-[80px]"
                            />
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                                setConfirmDialog((prev) => ({ ...prev, open: false }))
                            }
                            >
                            Annuler
                            </Button>
                            <Button
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                            onClick={handleReveillerTicket}
                            >
                            Confirmer la relance
                            </Button>
                        </div>
                        </div>
                    </DialogContent>
                    </Dialog>

                    </div>
                  )}

                  {/* Messages - Style moderne comme la page Message */}
                  {isExpanded && (
                    <div
                      className="space-y-4 animate-in slide-in-from-top-2 duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Separator />
                      {/* Onglets améliorés */}
                      <div className="flex gap-2">
                        <Button
                          variant={currentTab === "ai" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveTab((prev) => ({ ...prev, [ticket.id]: "ai" }))
                            setTimeout(() => scrollToBottom(ticket.id), 100)
                          }}
                          className={`flex items-center gap-2 ${
                            currentTab === "ai" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : ""
                          }`}
                        >
                          <Bot className="w-4 h-4" />
                          IA ({ticket.aiMessages.length})
                          {isAiTyping && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
                        </Button>
                        <Button
                          variant={currentTab === "agent" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveTab((prev) => ({ ...prev, [ticket.id]: "agent" }))
                            setTimeout(() => scrollToBottom(ticket.id), 100)
                          }}
                          className={`flex items-center gap-2 ${
                            currentTab === "agent" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : ""
                          }`}
                        >
                          <Headphones className="w-4 h-4" />
                          Agent ({ticket.agentMessages.length})
                        </Button>
                      </div>

                      {/* Zone de messages avec style moderne */}
                      <ScrollArea
                        className="h-64 w-full border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                        ref={(el) => {
                          scrollRefs.current[ticket.id] = el
                        }}
                      >
                        <div className="space-y-4">
                          {currentMessages.length === 0 ? (
                            <div className="text-center py-8">
                              <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                              <p className="text-gray-500 text-sm">
                                {currentTab === "ai"
                                  ? "Commencez une conversation avec l'IA !"
                                  : "Aucun message avec les agents"}
                              </p>
                            </div>
                          ) : (
                            currentMessages.map((message, index) => (
                              <div key={index} className="space-y-2">
                                {message.senderType === "USER" ? (
                                  <div className="flex justify-start">
                                    <div className="max-w-[80%] bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg rounded-bl-none shadow-md">
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
                                      className={`max-w-[80%] p-3 rounded-lg rounded-br-none shadow-md ${
                                        currentTab === "ai"
                                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                                          : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
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

                          {/* Indicateur de frappe pour l'IA */}
                          {isAiTyping && currentTab === "ai" && (
                            <div className="flex justify-end">
                              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-lg rounded-br-none shadow-md">
                                <div className="flex items-center gap-2">
                                  <Bot className="w-3 h-3" />
                                  <span className="text-xs font-medium">Assistant IA</span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                                    <div
                                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                                      style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                                      style={{ animationDelay: "0.2s" }}
                                    ></div>
                                  </div>
                                  <span className="text-xs ml-2">En train d'analyser...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      {/* Zone de saisie améliorée */}
                      <div className="space-y-2">
                        <Textarea
                          placeholder={
                            currentTab === "ai"
                              ? "Posez votre question à l'IA..."
                              : "Votre message à l'équipe de support..."
                          }
                          value={newMessages[ticket.id]?.[currentTab] || ""}
                          onChange={(e) => handleMessageChange(ticket.id, currentTab, e.target.value)}
                          className="min-h-[60px] resize-none bg-white dark:bg-gray-800 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage(ticket.id, currentTab)
                            }
                          }}
                        />
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {currentTab === "ai" ? (
                              <span className="flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                IA prête à répondre
                              </span>
                            ) : (
                              <span>Entrée pour envoyer, Shift+Entrée pour nouvelle ligne</span>
                            )}
                          </div>
                          <Button
                            onClick={() => sendMessage(ticket.id, currentTab)}
                            disabled={
                              sendingMessage[ticket.id]?.[currentTab] ||
                              !newMessages[ticket.id]?.[currentTab]?.trim() ||
                              isAiTyping
                            }
                            size="sm"
                            className={`${
                              currentTab === "ai"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            } text-white shadow-lg`}
                          >
                            {sendingMessage[ticket.id]?.[currentTab] ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Indicateur de messages quand fermé */}
                  {!isExpanded && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Bot className="w-3 h-3 text-blue-500" />
                          <span>{ticket.aiMessages.length} IA</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Headphones className="w-3 h-3 text-purple-500" />
                          <span>{ticket.agentMessages.length} Agent</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">Cliquer pour voir les messages</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun ticket trouvé</h3>
            <p className="text-gray-500">
              {searchTerm ||
              (selectedCategory && selectedCategory !== "all") ||
              (selectedPriority && selectedPriority !== "all") ||
              (selectedStatus && selectedStatus !== "all")
                ? "Essayez de modifier vos filtres de recherche"
                : userRole === "CLIENT"
                  ? "Vous n'avez pas encore créé de ticket"
                  : "Aucun ticket n'a été créé pour le moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
