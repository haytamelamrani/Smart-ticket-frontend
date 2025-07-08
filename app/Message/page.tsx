"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Bot,
  Send,
  MessageSquare,
  Clock,
  User,
  Headphones,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Sparkles,
  Brain,
  Zap,
  MessageCircle,
  Mail,
} from "lucide-react"
import { toast } from "sonner"

// Configuration API avec fallbacks
const getApiUrl = () => {
  const urls = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://0.0.0.0:8080",
  ].filter(Boolean)
  return urls[0] || "http://localhost:8080"
}

const API_BASE_URL = getApiUrl()

// Configuration axios avec timeout et retry
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Augmenté pour l'IA
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token automatiquement
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

interface Message {
  id: number
  content: string
  senderId: string
  senderType: string
  channel: string
  status: string
  timestamp: string
  ticketId: number
  analysis?: {
    sentiment: string
    complexity: string
    category: string
    confidence: number
    needsHuman: boolean
  }
}

interface TicketWithMessages {
  id: number
  title: string
  description: string
  status: string
  category: string
  priority: string
  type: string
  email: string
  createdAt: string
  aiMessages: Message[]
  agentMessages: Message[]
}

const statusConfig = {
  NOUVEAU: { label: "Nouveau", color: "bg-blue-500 text-white", emoji: "🆕" },
  EN_COURS: { label: "En cours", color: "bg-amber-500 text-white", emoji: "⏳" },
  RESOLU: { label: "Résolu", color: "bg-emerald-500 text-white", emoji: "✅" },
  FERME: { label: "Fermé", color: "bg-slate-500 text-white", emoji: "🔒" },
  EN_ATTENTE: { label: "En attente", color: "bg-orange-500 text-white", emoji: "⏸️" },
}

// Données de démonstration améliorées
const getDemoTickets = (): TicketWithMessages[] => [
  {
    id: 1,
    title: "Problème de connexion",
    description: "Je n'arrive pas à me connecter à mon compte",
    status: "NOUVEAU",
    category: "technical",
    priority: "medium",
    type: "incident",
    email: "user@example.com",
    createdAt: new Date().toISOString(),
    aiMessages: [
      {
        id: 1,
        content: `🔐 Bonjour ! Je comprends votre problème de connexion. Voici ce que nous allons faire ensemble :

**Étapes de diagnostic :**
1. ✅ Vérifiez que votre email est correct
2. 🔄 Essayez de réinitialiser votre mot de passe
3. 🌐 Testez avec un autre navigateur
4. 🧹 Videz le cache et les cookies

**Question :** Quel message d'erreur voyez-vous exactement ? Cela m'aidera à vous donner une solution plus précise ! 🎯`,
        senderId: "ai",
        senderType: "SYSTEM",
        channel: "ai",
        status: "sent",
        timestamp: new Date().toISOString(),
        ticketId: 1,
        analysis: {
          sentiment: "positive",
          complexity: "medium",
          category: "technical",
          confidence: 0.9,
          needsHuman: false,
        },
      },
    ],
    agentMessages: [],
  },
  {
    id: 2,
    title: "Question sur la facturation",
    description: "J'ai une question concernant ma dernière facture",
    status: "EN_COURS",
    category: "billing",
    priority: "low",
    type: "request",
    email: "user@example.com",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    aiMessages: [
      {
        id: 2,
        content: `💳 **Questions de facturation détectées !**

Je vais vous aider avec votre facture. Pour vous donner la meilleure assistance :

**Informations utiles :**
- 📧 Numéro de facture (si disponible)
- 📅 Date de la facture concernée
- ❓ Nature de votre question

**Actions possibles :**
1. 🔍 Explication des frais
2. 💰 Questions de paiement
3. 📄 Demande de duplicata
4. 🔄 Modification de facturation

Pouvez-vous me préciser votre question ? Je suis là pour vous aider ! 🚀`,
        senderId: "ai",
        senderType: "SYSTEM",
        channel: "ai",
        status: "sent",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        ticketId: 2,
        analysis: {
          sentiment: "neutral",
          complexity: "simple",
          category: "billing",
          confidence: 0.95,
          needsHuman: true,
        },
      },
    ],
    agentMessages: [
      {
        id: 3,
        content: `📨 **Message reçu et traité !**

Votre demande concernant la facturation a été transmise à notre équipe spécialisée.

**Prochaines étapes :**
- ⏱️ Réponse sous 2-4h ouvrées
- 📧 Notification par email
- 🔍 Analyse complète de votre dossier

Merci pour votre patience ! Notre équipe billing va vous contacter rapidement. 🙏✨`,
        senderId: "agent",
        senderType: "SYSTEM",
        channel: "agent",
        status: "sent",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ticketId: 2,
      },
    ],
  },
]

export default function MessagesPage() {
  const [tickets, setTickets] = useState<TicketWithMessages[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessages, setNewMessages] = useState<{ [key: number]: { ai: string; agent: string } }>({})
  const [sendingMessage, setSendingMessage] = useState<{ [key: number]: { ai: boolean; agent: boolean } }>({})
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<{ [key: number]: "ai" | "agent" }>({})
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [aiTyping, setAiTyping] = useState<{ [key: number]: boolean }>({})

  // États pour la gestion des rôles
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")

  // Refs pour auto-scroll
  const scrollRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const rawEmail = typeof window !== "undefined" ? localStorage.getItem("email") : null

  if (!rawEmail) {
    console.error("❌ Aucun email trouvé dans localStorage")
    toast.error("Vous devez être connecté pour envoyer un message.")
    return null
  }


  // Auto-scroll vers le bas des conversations
  const scrollToBottom = (ticketId: number) => {
    setTimeout(() => {
      const scrollElement = scrollRefs.current[ticketId]
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }, 100)
  }

  // Test de connectivité amélioré
  const testConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/with-messages`, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Récupérer les tickets avec gestion d'erreur
  const fetchTickets = useCallback(async (showToast = false) => {
    try {
      if (showToast) setLoading(true)
      setConnectionStatus("checking")

      const response = await apiClient.get<TicketWithMessages[]>("/api/tickets/with-messages")
      setTickets(response.data)
      setConnectionStatus("connected")
      setIsOfflineMode(false)

      if (showToast) {
        toast.success("Messages chargés avec succès")
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la récupération des tickets:", error)
      setConnectionStatus("disconnected")

      let errorMessage = "Erreur de connexion"
      if (error.code === "ECONNREFUSED") {
        errorMessage = "Serveur non accessible"
      } else if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
        errorMessage = "Problème de réseau"
      } else if (error.response?.status === 401) {
        errorMessage = "Session expirée"
      } else if (error.response?.status >= 500) {
        errorMessage = "Erreur serveur"
      }

      if (showToast) {
        toast.error("Mode hors ligne", {
          description: `${errorMessage}. Utilisation des données de démonstration.`,
        })
      }

      setTickets(getDemoTickets())
      setIsOfflineMode(true)
    } finally {
      if (showToast) setLoading(false)
    }
  }, [])

  // Initialisation
  useEffect(() => {
    // Récupérer le rôle et l'email depuis localStorage
    const role = localStorage.getItem("role") || ""
    const email = localStorage.getItem("email") || ""
    setUserRole(role)
    setUserEmail(email)

    fetchTickets(true) // ✅ premier toast affiché une seule fois

    testConnection().then((isConnected) => {
      if (!isConnected) {
        console.warn("⚠️ Backend non accessible, mode hors ligne activé")
      }
    })

    const interval = setInterval(() => {
      if (connectionStatus === "connected") {
        fetchTickets(false) // ❌ pas de toast ici
      }
    }, 30000)

    return () => clearInterval(interval)
  }, []) // ❗️ Retire connectionStatus ici pour éviter les appels en boucle

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
      if (isOfflineMode) {
        await simulateMessageSending(ticketId, message, channel)
      } else {
        await saveMessage(ticketId, message, "USER", channel)

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
        } else {
          const confirmationMessage = `📨 **Message reçu et traité !**

Votre demande a été transmise à notre équipe de support.

**Prochaines étapes :**
- ⏱️ Réponse sous 2-4h ouvrées  
- 📧 Notification par email
- 🔍 Analyse de votre demande

Merci pour votre patience ! Un agent va vous contacter rapidement. 🙏✨`

          await saveMessage(ticketId, confirmationMessage, "SYSTEM", channel)
        }

        await fetchTickets(false)
      }

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
        data: err.response?.data, // 👈 ajoute bien ceci !
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

  // Simulation améliorée pour le mode hors ligne
  const simulateMessageSending = async (ticketId: number, message: string, channel: "ai" | "agent") => {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const userMessage: Message = {
      id: Date.now(),
      content: message,
      senderId: userEmail,
      senderType: "USER",
      channel,
      status: "sent",
      timestamp: new Date().toISOString(),
      ticketId,
    }

    let systemResponse: Message | null = null

    if (channel === "ai") {
      setAiTyping((prev) => ({ ...prev, [ticketId]: true }))
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const ticket = tickets.find((t) => t.id === ticketId)
      const aiResponse = await getEnhancedAIResponse(message, ticket)

      systemResponse = {
        id: Date.now() + 1,
        content: aiResponse.response,
        senderId: "ai",
        senderType: "SYSTEM",
        channel,
        status: "sent",
        timestamp: new Date().toISOString(),
        ticketId,
        analysis: aiResponse.analysis,
      }

      setAiTyping((prev) => ({ ...prev, [ticketId]: false }))
    } else {
      systemResponse = {
        id: Date.now() + 1,
        content: `📨 **Message reçu et traité !**

Votre demande a été transmise à notre équipe de support.

**Prochaines étapes :**
- ⏱️ Réponse sous 2-4h ouvrées
- 📧 Notification par email  
- 🔍 Analyse de votre demande

Merci pour votre patience ! Un agent va vous contacter rapidement. 🙏✨`,
        senderId: "agent",
        senderType: "SYSTEM",
        channel,
        status: "sent",
        timestamp: new Date().toISOString(),
        ticketId,
      }
    }

    // Mettre à jour les tickets localement
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === ticketId) {
          const updatedTicket = { ...ticket }
          if (channel === "ai") {
            updatedTicket.aiMessages = [...updatedTicket.aiMessages, userMessage, systemResponse!]
          } else {
            updatedTicket.agentMessages = [...updatedTicket.agentMessages, userMessage, systemResponse!]
          }
          return updatedTicket
        }
        return ticket
      }),
    )

    scrollToBottom(ticketId)
  }

  const saveMessage = async (
    ticketId: number,
    content: string,
    senderType: string,
    channel: string,
    analysis?: any,
  ) => {
    const senderId = typeof window !== "undefined" ? localStorage.getItem("email") : null
    console.log("📨 senderId récupéré :", senderId)

    const messageData = {
      ticketId,
      content: content.trim(),
      senderType,
      senderId,
      channel,
      status: "sent",
      timestamp: new Date().toISOString(),
      ...(analysis && { analysis }), // ✅ facultatif si défini
    }

    console.log("📤 Données envoyées à /api/messages :", messageData)

    // ✅ Vérifications strictes
    if (!ticketId || !messageData.content || !senderType || !channel || !senderId) {
      console.error("❌ Champs manquants ou invalides", messageData)
      toast.error("Impossible d'envoyer le message : champ requis manquant.")
      return
    }

    try {
      const response = await apiClient.post("/api/messages", messageData)
      toast.success("✅ Message envoyé !")
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

  const toggleTicketExpansion = (ticketId: number) => {
    setExpandedTickets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId)
      } else {
        newSet.add(ticketId)
        setActiveTab((prev) => ({ ...prev, [ticketId]: "ai" }))
        setTimeout(() => scrollToBottom(ticketId), 200)
      }
      return newSet
    })
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

  const filteredTickets = tickets.filter((ticket) => {
    // Filtrage par rôle
    if (userRole === "CLIENT") {
      // CLIENT ne voit que ses tickets
      const ticketEmail = ticket.email 
      if (ticketEmail !== userEmail) {
        return false
      }
    }
    // ADMIN et AGENT voient tous les tickets

    // Filtrage par recherche
    if (searchTerm) {
      return (
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Chargement des messages...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Connexion à: {API_BASE_URL}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header amélioré */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4 shadow-lg">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Mes Messages
            <Sparkles className="inline w-6 h-6 ml-2 text-yellow-500" />
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {userRole === "CLIENT"
              ? "Vos conversations avec l'IA et support expert"
              : "Toutes les conversations clients"}
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

          {/* Indicateur de statut amélioré */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" ? (
                <Wifi className="w-4 h-4 text-emerald-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {connectionStatus === "connected"
                  ? "Connecté"
                  : connectionStatus === "disconnected"
                    ? "Mode hors ligne"
                    : "Vérification..."}
              </span>
            </div>

            {connectionStatus === "connected" && (
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">IA Avancée Active</span>
              </div>
            )}

            {isOfflineMode && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <Zap className="w-3 h-3 mr-1" />
                Données de démonstration
              </Badge>
            )}
          </div>
        </div>

        {/* Alerte de connexion améliorée */}
        {connectionStatus === "disconnected" && (
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-orange-900 dark:text-orange-100">Mode hors ligne activé</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                    Impossible de se connecter au serveur ({API_BASE_URL}). L'IA fonctionne en mode démonstration.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTickets(true)}
                    className="mt-2 text-orange-700 border-orange-300 hover:bg-orange-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Réessayer la connexion
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Badge du nombre de tickets */}
        <div className="mb-6 flex justify-center">
          <Badge variant="secondary" className="text-sm px-4 py-2">
            {filteredTickets.length} conversation{filteredTickets.length > 1 ? "s" : ""}
            {userRole === "CLIENT"
              ? " personnelle" + (filteredTickets.length > 1 ? "s" : "")
              : " client" + (filteredTickets.length > 1 ? "s" : "")}
          </Badge>
        </div>

        {/* Tickets améliorés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => {
            const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.NOUVEAU
            const isExpanded = expandedTickets.has(ticket.id)
            const currentTab = activeTab[ticket.id] || "ai"
            const currentMessages = currentTab === "ai" ? ticket.aiMessages : ticket.agentMessages
            const isAiTyping = aiTyping[ticket.id] || false

            return (
              <Card
                key={ticket.id}
                className="shadow-lg hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700"
              >
                <CardHeader className="cursor-pointer" onClick={() => toggleTicketExpansion(ticket.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={statusInfo.color}>
                        <span className="mr-1">{statusInfo.emoji}</span>
                        {statusInfo.label}
                      </Badge>
                      <CardTitle className="text-lg">Ticket #{ticket.id}</CardTitle>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  <CardDescription className="line-clamp-2">{ticket.title}</CardDescription>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4" onClick={(e) => e.stopPropagation()}>
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
                        IA Avancée ({ticket.aiMessages.length})
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
                        Support Expert ({ticket.agentMessages.length})
                      </Button>
                    </div>

                    {/* Zone de messages améliorée */}
                    <ScrollArea
                      className="h-80 w-full border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                      ref={(el) => {
                        scrollRefs.current[ticket.id] = el
                      }}
                    >
                      <div className="space-y-4">
                        {currentMessages.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">
                              {currentTab === "ai"
                                ? "Commencez une conversation avec l'IA !"
                                : "Aucun message avec les agents"}
                            </p>
                            {currentTab === "ai" && (
                              <p className="text-sm text-gray-400 mt-1">
                                L'IA peut vous aider avec tous types de questions
                              </p>
                            )}
                          </div>
                        ) : (
                          currentMessages.map((message, index) => (
                            <div key={index} className="space-y-2">
                              {message.senderType === "USER" ? (
                                <div className="flex justify-start">
                                  <div className="max-w-[80%] bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg rounded-bl-none shadow-md">
                                    <div className="flex items-center gap-2 mb-1">
                                      <User className="w-4 h-4" />
                                      <span className="text-xs font-medium">Vous</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                                          <Bot className="w-4 h-4" />
                                          <span className="text-xs font-medium">Assistant IA</span>
                                          {message.analysis?.confidence && (
                                            <Badge variant="secondary" className="text-xs bg-white/20">
                                              {Math.round(message.analysis.confidence * 100)}%
                                            </Badge>
                                          )}
                                        </>
                                      ) : (
                                        <>
                                          <Headphones className="w-4 h-4" />
                                          <span className="text-xs font-medium">Support Expert</span>
                                        </>
                                      )}
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap prose prose-sm prose-invert max-w-none">
                                      {message.content}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center gap-1 text-xs opacity-75">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                                      </div>
                                      {message.analysis && (
                                        <div className="flex items-center gap-1">
                                          {message.analysis.needsHuman && (
                                            <Badge variant="secondary" className="text-xs bg-white/20">
                                              Escalade suggérée
                                            </Badge>
                                          )}
                                        </div>
                                      )}
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
                                <Bot className="w-4 h-4" />
                                <span className="text-xs font-medium">Assistant IA</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                  <div
                                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 bg-white rounded-full animate-bounce"
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
                            ? "Posez votre question à l'IA... (Elle peut tout comprendre !)"
                            : "Votre message à l'équipe de support..."
                        }
                        value={newMessages[ticket.id]?.[currentTab] || ""}
                        onChange={(e) => handleMessageChange(ticket.id, currentTab, e.target.value)}
                        className="min-h-[80px] resize-none bg-white dark:bg-gray-800"
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
                              <Sparkles className="w-3 h-3" />
                              IA prête à répondre à tout type de question
                            </span>
                          ) : (
                            <span>Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne</span>
                          )}
                        </div>
                        <Button
                          onClick={() => sendMessage(ticket.id, currentTab)}
                          disabled={
                            sendingMessage[ticket.id]?.[currentTab] ||
                            !newMessages[ticket.id]?.[currentTab]?.trim() ||
                            isAiTyping
                          }
                          className={`${
                            currentTab === "ai"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          } text-white shadow-lg`}
                        >
                          {sendingMessage[ticket.id]?.[currentTab] ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Message vide amélioré */}
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <div className="relative inline-block">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-yellow-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Aucune conversation trouvée</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Essayez de modifier votre recherche"
                : userRole === "CLIENT"
                  ? "Vous n'avez pas encore de conversations"
                  : "Aucune conversation client disponible"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
