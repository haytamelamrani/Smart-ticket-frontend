"use client"

import { useEffect } from "react"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Tag,
  Clock,
  FileText,
  X,
  Mail,
  User,
  MessageSquare,
  Bot,
  Headphones,
  Sparkles,
  Send,
  MessageCircle,
} from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

interface TicketFormData {
  title: string
  description: string
  category: string
  priority: string
  type: string
  userEmail: string
  attachments: File[]
}

interface AIPrediction {
  type: string
  category: string
  priority: string
  suggestedResponse: string
}

const categories = [
  {
    value: "technical",
    label: "Problème technique",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: "🔧",
  },
  {
    value: "account",
    label: "Compte utilisateur",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    icon: "👤",
  },
  {
    value: "billing",
    label: "Facturation",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    icon: "💳",
  },
  {
    value: "feature",
    label: "Demande de fonctionnalité",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    icon: "✨",
  },
  {
    value: "bug",
    label: "Signalement de bug",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: "🐛",
  },
  {
    value: "other",
    label: "Autre",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    icon: "📋",
  },
]

const priorities = [
  { value: "low", label: "Faible", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: "🟢" },
  {
    value: "medium",
    label: "Moyenne",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    icon: "🟡",
  },
  {
    value: "high",
    label: "Élevée",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    icon: "🟠",
  },
  {
    value: "urgent",
    label: "Urgente",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: "🔴",
  },
]

const ticketTypes = [
  { value: "incident", label: "Incident", icon: "⚠️" },
  { value: "request", label: "Demande", icon: "📝" },
  { value: "complaint", label: "Réclamation", icon: "😤" },
  { value: "suggestion", label: "Suggestion", icon: "💡" },
]

export default function CreateTicketPage() {
  useEffect(() => {
    const savedEmail = localStorage.getItem("email")
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, userEmail: savedEmail }))
    }
  }, [])

  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    category: "",
    priority: "",
    type: "",
    userEmail: "",
    attachments: [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [ticketId, setTicketId] = useState<string>("")
  const [createdTicketId, setCreatedTicketId] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null)
  const [showAIChat, setShowAIChat] = useState(false)
  const [showAgentChat, setShowAgentChat] = useState(false)
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [agentChatMessages, setAgentChatMessages] = useState<Array<{ role: "user" | "agent"; content: string }>>([])
  const [aiChatInput, setAiChatInput] = useState("")
  const [agentChatInput, setAgentChatInput] = useState("")

  // Fonction pour prédire avec Hugging Face
  const predictWithAI = async (title: string, description: string) => {
    if (!title.trim() && !description.trim()) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/predict-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) {
        throw new Error("Failed to predict")
      }

      const prediction: AIPrediction = await response.json()
      setAiPrediction(prediction)

      // Toujours appliquer les nouvelles prédictions (remplacer les anciennes)
      setFormData((prev) => ({
        ...prev,
        type: prediction.type,
        category: prediction.category,
        priority: prediction.priority,
      }))

      toast.success("Classification IA mise à jour", {
        description: "Type, catégorie et priorité reclassifiés automatiquement",
      })
    } catch (error) {
      console.error("Erreur lors de la prédiction:", error)
      toast.error("Erreur IA", {
        description: "Impossible de prédire automatiquement les champs",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Utiliser useEffect pour déclencher la prédiction quand le titre ou la description change
  useEffect(() => {
    if (formData.title.trim() || formData.description.trim()) {
      const timeoutId = setTimeout(() => {
        predictWithAI(formData.title, formData.description)
      }, 1000) // Délai pour éviter trop d'appels API

      return () => clearTimeout(timeoutId)
    }
  }, [formData.title, formData.description])

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }))
  }

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error("Erreur de validation", { description: "Le titre est obligatoire" })
      return false
    }

    if (!formData.description.trim()) {
      toast.error("Erreur de validation", { description: "La description est obligatoire" })
      return false
    }

    if (!formData.category) {
      toast.error("Erreur de validation", { description: "Veuillez sélectionner une catégorie" })
      return false
    }

    if (!formData.priority) {
      toast.error("Erreur de validation", { description: "Veuillez sélectionner une priorité" })
      return false
    }

    if (!formData.type) {
      toast.error("Erreur de validation", { description: "Veuillez sélectionner un type de ticket" })
      return false
    }

    if (!formData.userEmail.trim() || !formData.userEmail.includes("@")) {
      toast.error("Erreur de validation", { description: "Veuillez saisir une adresse email valide" })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Créer FormData pour l'envoi au backend selon votre TicketRequestDto
      const data = new FormData()
      data.append("title", formData.title)
      data.append("description", formData.description)
      data.append("category", formData.category)
      data.append("priority", formData.priority)
      data.append("type", formData.type)
      data.append("userEmail", formData.userEmail)
      data.append("etat", "NOUVEAU")

      // Ajouter les fichiers joints
      formData.attachments.forEach((file) => {
        data.append("attachments", file)
      })

      const token = localStorage.getItem("token")

      console.log("🎯 Envoi du ticket au backend...")

      
      // Appel à votre backend Spring Boot
      const response = await axios.post("http://localhost:8080/api/tickets", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("✅ Réponse du backend:", response.data)

      // Utiliser la réponse selon votre TicketResponseDto
      const ticketResponse = response.data
      const displayTicketId = ticketResponse.ticketId || `TK-${Date.now().toString().slice(-6)}`

      setTicketId(displayTicketId)
      setCreatedTicketId(ticketResponse.ticketId)
      setSubmitStatus("success")

      // Initialiser les chats avec des messages d'accueil
      const initialAIMessage =
        aiPrediction?.suggestedResponse ||
        "Bonjour ! Je suis votre assistant IA. J'ai analysé votre ticket et je suis là pour vous aider. Comment puis-je vous assister davantage ?"

      const initialAgentMessage =
        "Bonjour ! Notre équipe va traiter votre problème et vous répondre le plus tôt possible. Un agent humain prendra en charge votre demande dans les plus brefs délais. En attendant, n'hésitez pas à nous donner plus de détails si nécessaire."

      setAiChatMessages([
        {
          role: "assistant",
          content: initialAIMessage,
        },
      ])

      setAgentChatMessages([
        {
          role: "agent",
          content: initialAgentMessage,
        },
      ])

      // Sauvegarder les messages initiaux
      await saveMessage(initialAIMessage, "ai", "SYSTEM")
      await saveMessage(initialAgentMessage, "agent", "AGENT")

      toast.success("Ticket créé avec succès !", {
        description: `Votre ticket ${displayTicketId} a été créé.`,
      })
    } catch (error) {
      console.error("❌ Erreur lors de la création du ticket:", error)
      setSubmitStatus("error")

      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Erreur de communication avec le serveur"
        toast.error("Erreur lors de la création", {
          description: errorMessage,
        })
      } else {
        toast.error("Erreur lors de la création", {
          description: "Une erreur inattendue est survenue.",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleFermerTicket = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/api/tickets/${Number.parseInt(ticketId.replace("TK-", ""))}/fermer-par-client`,
        null,
        {
          params: { email:formData.userEmail },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ Ticket archivé :", response.data);
    } catch (error) {
      console.error("Erreur lors de la fermeture :", error);
    }
  };
  // Fonction pour enregistrer un message selon votre MessageDto
  const saveMessage = async (content: string, channel: "ai" | "agent", senderType: "USER" | "SYSTEM" | "AGENT") => {
    if (!createdTicketId) return

    try {
      console.log("Ticket ID utilisé :", createdTicketId)

      const messageData = {
        ticketId: Number.parseInt(createdTicketId.replace("TK-", "")),
        content: content,
        senderType: senderType,
        senderId: formData.userEmail,
        channel: channel,
        status: channel === "agent" ? "sent" : null,
        timestamp: new Date().toISOString(),
      }

      console.log("💬 Sauvegarde du message:", messageData)

      // Appel à votre endpoint de messages (à créer)
      const response= await axios.post("http://localhost:8080/api/messages", messageData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
      return response.data
      console.log("✅ Message sauvegardé")
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde du message:", error)
    }
  }

  const handleAIChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiChatInput.trim()) return

    const userMessage = aiChatInput.trim()
    setAiChatInput("")

    setAiChatMessages((prev) => [...prev, { role: "user", content: userMessage }])

    // Sauvegarder le message utilisateur
    await saveMessage(userMessage, "ai", "USER")

    // Ajouter un indicateur de frappe
    setAiChatMessages((prev) => [...prev, { role: "assistant", content: "..." }])

    try {
      // Communication directe avec l'API IA
      const response = await fetch("/api/chat-ai-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          ticketContext: {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            type: formData.type,
          },
        }),
      })

      const data = await response.json()
      const aiResponse = data.response

      // Remplacer l'indicateur de frappe par la vraie réponse
      setAiChatMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = { role: "assistant", content: aiResponse }
        return newMessages
      })

      // Sauvegarder la réponse de l'IA
      await saveMessage(aiResponse, "ai", "SYSTEM")
    } catch (error) {
      console.error("Erreur chat IA:", error)
      const errorMessage = "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants."

      // Remplacer l'indicateur de frappe par le message d'erreur
      setAiChatMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = { role: "assistant", content: errorMessage }
        return newMessages
      })

      await saveMessage(errorMessage, "ai", "SYSTEM")
    }
  }

  const handleAgentChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentChatInput.trim()) return

    const userMessage = agentChatInput.trim()
    setAgentChatInput("")

    setAgentChatMessages((prev) => [...prev, { role: "user", content: userMessage }])

    // Sauvegarder le message utilisateur
    await saveMessage(userMessage, "agent", "USER")

    // Ajouter un message d'attente
    const confirmationMessage = `📨 **Message reçu et traité !**

Votre demande a été transmise à notre équipe de support.

**Prochaines étapes :**
- ⏱️ Réponse sous 2-4h ouvrées  
- 📧 Notification par email
- 🔍 Analyse de votre demande

Merci pour votre patience ! Un agent va vous contacter rapidement. 🙏✨`

    setAgentChatMessages((prev) => [
      ...prev,
      {
        role: "agent",
        content: confirmationMessage,
      },
    ])

    // Sauvegarder le message d'attente
    await saveMessage(confirmationMessage, "agent", "SYSTEM")
  }

  const selectedCategory = categories.find((cat) => cat.value === formData.category)
  const selectedPriority = priorities.find((pri) => pri.value === formData.priority)
  const selectedType = ticketTypes.find((type) => type.value === formData.type)

  return (
    <div className="min-h-screen py-12 relative">
      <div className="container mx-auto px-4 py-8">
        {/* Success Banner */}
        {submitStatus === "success" && (
          <div className="mb-8">
            <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/50 shadow-xl">
              <CardHeader className="text-center pb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-emerald-800 dark:text-emerald-200">
                  Ticket créé avec succès !
                </CardTitle>
                <CardDescription className="text-emerald-600 dark:text-emerald-400 text-lg">
                  Votre demande a été enregistrée et sera traitée par notre équipe
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                  <p className="text-sm text-muted-foreground mb-3">Numéro de ticket</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">{ticketId}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">
                      Confirmation envoyée à <strong className="text-foreground">{formData.userEmail}</strong>
                    </span>
                  </div>
                </div>

                {/* Options de support - Deux divs côte à côte */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                  <div
                    onClick={() => setShowAIChat(!showAIChat)}
                    className="cursor-pointer p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-blue-500 rounded-full">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Assistant IA</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
                      Obtenez une aide immédiate avec notre IA qui a analysé votre ticket
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 bg-transparent"
                    >
                      Ouvrir le chat IA
                    </Button>
                  </div>

                  <div
                    onClick={() => setShowAgentChat(!showAgentChat)}
                    className="cursor-pointer p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 bg-purple-500 rounded-full">
                        <Headphones className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">Agent Humain</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-300 mb-4">
                      Contactez directement notre équipe de support pour une aide personnalisée
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 bg-transparent"
                    >
                      Contacter un agent
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button
                    onClick={() => setSubmitStatus("idle")}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950"
                  >
                    Créer un autre ticket
                  </Button>
                  <Button onClick={handleFermerTicket}>
                    Fermer le ticket d'après la solution de chatbot ou la suggestion
                  </Button>
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg">
                    Suivre mon ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chat IA Interface - Style moderne comme la page Message */}
        {submitStatus === "success" && showAIChat && (
          <div className="mb-8">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700">
              <CardHeader className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      Assistant IA Avancé
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-blue-100 text-sm font-normal">Réponses intelligentes en temps réel</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIChat(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {/* Zone de messages avec ScrollArea */}
                <ScrollArea className="h-80 w-full border-0 p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-4">
                    {aiChatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Commencez une conversation avec l'IA !</p>
                        <p className="text-sm text-gray-400 mt-1">L'IA peut vous aider avec tous types de questions</p>
                      </div>
                    ) : (
                      aiChatMessages.map((message, index) => (
                        <div key={index} className="space-y-2">
                          {message.role === "user" ? (
                            <div className="flex justify-start">
                              <div className="max-w-[80%] bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg rounded-bl-none shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="w-4 h-4" />
                                  <span className="text-xs font-medium">Vous</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date().toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <div className="max-w-[80%] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-lg rounded-br-none shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                  <Bot className="w-4 h-4" />
                                  <span className="text-xs font-medium">Assistant IA</span>
                                  <Badge variant="secondary" className="text-xs bg-white/20">
                                    IA Avancée
                                  </Badge>
                                </div>
                                <div className="text-sm whitespace-pre-wrap prose prose-sm prose-invert max-w-none">
                                  {message.content === "..." ? (
                                    <div className="flex items-center gap-1">
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
                                  ) : (
                                    message.content
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date().toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Zone de saisie améliorée */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleAIChatSubmit} className="space-y-2">
                    <Textarea
                      placeholder="Posez votre question à l'IA... (Elle peut tout comprendre !)"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      className="min-h-[80px] resize-none bg-white dark:bg-gray-800"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleAIChatSubmit(e)
                        }
                      }}
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          IA prête à répondre à tout type de question
                        </span>
                      </div>
                      <Button
                        type="submit"
                        disabled={!aiChatInput.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chat Agent Interface - Style moderne comme la page Message */}
        {submitStatus === "success" && showAgentChat && (
          <div className="mb-8">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700">
              <CardHeader className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      Support Expert
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-purple-100 text-sm font-normal">Communication avec notre équipe</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAgentChat(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {/* Zone de messages avec ScrollArea */}
                <ScrollArea className="h-80 w-full border-0 p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-4">
                    {agentChatMessages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun message avec les agents</p>
                        <p className="text-sm text-gray-400 mt-1">Commencez une conversation avec notre équipe</p>
                      </div>
                    ) : (
                      agentChatMessages.map((message, index) => (
                        <div key={index} className="space-y-2">
                          {message.role === "user" ? (
                            <div className="flex justify-start">
                              <div className="max-w-[80%] bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg rounded-bl-none shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                  <User className="w-4 h-4" />
                                  <span className="text-xs font-medium">Vous</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date().toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <div className="max-w-[80%] bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 rounded-lg rounded-br-none shadow-md">
                                <div className="flex items-center gap-2 mb-1">
                                  <Headphones className="w-4 h-4" />
                                  <span className="text-xs font-medium">Support Expert</span>
                                </div>
                                <div className="text-sm whitespace-pre-wrap prose prose-sm prose-invert max-w-none">
                                  {message.content}
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date().toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Zone de saisie améliorée */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleAgentChatSubmit} className="space-y-2">
                    <Textarea
                      placeholder="Votre message à l'équipe de support..."
                      value={agentChatInput}
                      onChange={(e) => setAgentChatInput(e.target.value)}
                      className="min-h-[80px] resize-none bg-white dark:bg-gray-800"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleAgentChatSubmit(e)
                        }
                      }}
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <span>Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne</span>
                      </div>
                      <Button
                        type="submit"
                        disabled={!agentChatInput.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-6 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
            {submitStatus === "success" ? "Détails du ticket créé" : "Créer un nouveau ticket"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {submitStatus === "success"
              ? "Voici les détails de votre ticket. Choisissez votre mode d'assistance préféré ci-dessus."
              : "Décrivez votre problème ou demande et notre équipe vous aidera dans les plus brefs délais"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire principal */}
            <div className="lg:col-span-2 space-y-8">
              <Card
                className={`shadow-lg border-0 backdrop-blur-sm ${
                  submitStatus === "success"
                    ? "bg-emerald-50/70 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800"
                    : "bg-white/70 dark:bg-gray-900/70"
                }`}
              >
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Informations du ticket
                    {isAnalyzing && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span>IA Mixtral en cours d'analyse...</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {submitStatus === "success"
                      ? "Informations de votre ticket créé"
                      : "Décrivez votre problème ou demande de manière détaillée"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Votre adresse email</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={formData.userEmail}
                      onChange={(e) => handleInputChange("userEmail", e.target.value)}
                      disabled
                      className="h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                      <span>Titre du ticket</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Résumé concis de votre demande..."
                      disabled={submitStatus === "success"}
                      className="h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                      <span>Description détaillée</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Décrivez votre problème ou demande en détail. Incluez les étapes pour reproduire le problème si applicable..."
                      disabled={submitStatus === "success"}
                      className="min-h-[140px] border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`shadow-lg border-0 backdrop-blur-sm ${
                  submitStatus === "success"
                    ? "bg-emerald-50/70 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800"
                    : "bg-white/70 dark:bg-gray-900/70"
                }`}
              >
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Pièces jointes
                  </CardTitle>
                  <CardDescription className="text-base">
                    {submitStatus === "success"
                      ? "Fichiers joints à votre ticket"
                      : "Ajoutez des captures d'écran ou documents pour nous aider à mieux comprendre"}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {submitStatus !== "success" && (
                    <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-xl p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
                            Cliquez pour télécharger
                          </span>
                          <span className="text-muted-foreground"> ou glissez-déposez vos fichiers</span>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                        />
                        <p className="text-sm text-muted-foreground">PNG, JPG, PDF jusqu'à 10MB chacun</p>
                      </div>
                    </div>
                  )}

                  {formData.attachments.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <Label className="text-sm font-medium">
                        {submitStatus === "success" ? "Fichiers joints :" : "Fichiers sélectionnés :"}
                      </Label>
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800"
                          >
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                              {file.name}
                            </span>
                            {submitStatus !== "success" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAttachment(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar de catégorisation */}
            <div className="space-y-8">
              <Card
                className={`shadow-lg border-0 backdrop-blur-sm ${
                  submitStatus === "success"
                    ? "bg-emerald-50/70 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800"
                    : "bg-white/70 dark:bg-gray-900/70"
                }`}
              >
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Classification IA
                    {aiPrediction && submitStatus !== "success" && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Auto
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {submitStatus === "success"
                      ? "Classification finale de votre ticket"
                      : "Classification automatique basée sur votre description"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <span>Type de ticket</span>
                      <span className="text-red-500">*</span>
                      {aiPrediction?.type && submitStatus !== "success" && (
                        <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-600">
                          IA
                        </Badge>
                      )}
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange("type", value)}
                      disabled={submitStatus === "success"}
                    >
                      <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800">
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                              {type.value === aiPrediction?.type && <Sparkles className="w-3 h-3 text-emerald-500" />}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedType && (
                      <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                        <span>{selectedType.icon}</span>
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          {selectedType.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <span>Catégorie</span>
                      <span className="text-red-500">*</span>
                      {aiPrediction?.category && submitStatus !== "success" && (
                        <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-600">
                          IA
                        </Badge>
                      )}
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                      disabled={submitStatus === "success"}
                    >
                      <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                              {category.value === aiPrediction?.category && (
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCategory && (
                      <Badge className={`${selectedCategory.color} px-3 py-1`}>
                        <span className="mr-1">{selectedCategory.icon}</span>
                        {selectedCategory.label}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <span>Priorité</span>
                      <span className="text-red-500">*</span>
                      {aiPrediction?.priority && submitStatus !== "success" && (
                        <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-600">
                          IA
                        </Badge>
                      )}
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange("priority", value)}
                      disabled={submitStatus === "success"}
                    >
                      <SelectTrigger className="h-12 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 dark:border-emerald-800">
                        <SelectValue placeholder="Sélectionner une priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <span>{priority.icon}</span>
                              <span>{priority.label}</span>
                              {priority.value === aiPrediction?.priority && (
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPriority && (
                      <Badge className={`${selectedPriority.color} px-3 py-1`}>
                        <span className="mr-1">{selectedPriority.icon}</span>
                        {selectedPriority.label}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`shadow-lg border-0 backdrop-blur-sm ${
                  submitStatus === "success"
                    ? "bg-emerald-50/70 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800"
                    : "bg-white/70 dark:bg-gray-900/70"
                }`}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Temps de réponse estimé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.priority === "urgent" && (
                    <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        <strong>🔴 Urgent :</strong> Réponse sous 2h pendant les heures ouvrables
                      </AlertDescription>
                    </Alert>
                  )}
                  {formData.priority === "high" && (
                    <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-700 dark:text-orange-300">
                        <strong>🟠 Élevée :</strong> Réponse sous 4h pendant les heures ouvrables
                      </AlertDescription>
                    </Alert>
                  )}
                  {formData.priority === "medium" && (
                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                      <AlertDescription className="text-amber-700 dark:text-amber-300">
                        <strong>🟡 Moyenne :</strong> Réponse sous 24h
                      </AlertDescription>
                    </Alert>
                  )}
                  {formData.priority === "low" && (
                    <Alert className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <AlertDescription className="text-gray-700 dark:text-gray-300">
                        <strong>🟢 Faible :</strong> Réponse sous 72h
                      </AlertDescription>
                    </Alert>
                  )}
                  {!formData.priority && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sélectionnez une priorité pour voir le temps de réponse estimé
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {submitStatus !== "success" && (
            <>
              <Separator className="my-8 bg-emerald-200 dark:bg-emerald-800" />
              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950 h-12 px-8 bg-transparent"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg h-12 px-8 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Créer le ticket
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
