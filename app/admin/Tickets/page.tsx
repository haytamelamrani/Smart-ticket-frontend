"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bug,
  Lightbulb,
  HelpCircle,
  Filter,
  Calendar,
  Mail,
  Settings,
  Shield,
} from "lucide-react"
import { toast } from "sonner"

interface Ticket {
  id: number
  title: string
  description: string
  priority: string
  type: string
  status: string
  category?: string
  userEmail?: string
  email?: string
  createdAt: string
  updatedAt?: string
}

// Configuration des priorités avec couleurs et icônes
const priorityConfig = {
  FAIBLE: {
    label: "Faible",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    emoji: "🟢",
    icon: CheckCircle2,
  },
  MOYENNE: {
    label: "Moyenne",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    emoji: "🟡",
    icon: Clock,
  },
  ELEVEE: {
    label: "Élevée",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    emoji: "🟠",
    icon: AlertTriangle,
  },
  URGENTE: {
    label: "Urgente",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    emoji: "🔴",
    icon: AlertTriangle,
  },
}

// Configuration des types
const typeConfig = {
  BUG: {
    label: "Bug",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    emoji: "🐛",
    icon: Bug,
  },
  FEATURE: {
    label: "Fonctionnalité",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    emoji: "✨",
    icon: Lightbulb,
  },
  QUESTION: {
    label: "Question",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    emoji: "❓",
    icon: HelpCircle,
  },
  INCIDENT: {
    label: "Incident",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    emoji: "⚠️",
    icon: AlertTriangle,
  },
}

// Configuration des statuts
const statusConfig = {
  NOUVEAU: {
    label: "Nouveau",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    emoji: "🆕",
  },
  EN_ATTENTE: {
    label: "En attente",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    emoji: "⏳",
  },
  EN_COURS: {
    label: "En cours",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    emoji: "🔄",
  },
  CLOS: {
    label: "Clos",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    emoji: "✅",
  },
  FERME: {
    label: "Fermé",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    emoji: "🔒",
  },
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Ticket>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Filtrage des tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.userEmail && ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.email && ticket.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority
    const matchesType = filterType === "all" || ticket.type === filterType
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus

    return matchesSearch && matchesPriority && matchesType && matchesStatus
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Erreur d'authentification", {
        description: "Token manquant. Veuillez vous reconnecter.",
      })
      return
    }

    try {
      setLoading(true)
      const response = await axios.get("http://localhost:8080/api/admin/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTickets(response.data)
      toast.success("Tickets chargés", {
        description: `${response.data.length} ticket(s) récupéré(s)`,
      })
    } catch (error: any) {
      console.error("❌ Erreur GET /admin/tickets :", error)
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les tickets",
      })
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (id: number) => {
    setTicketToDelete(id)
    setDeleteDialogOpen(true)
  }

  const deleteTicket = async () => {
    if (!ticketToDelete) return

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Erreur d'authentification")
      return
    }

    try {
      await axios.delete(`http://localhost:8080/api/admin/tickets/${ticketToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setTickets(tickets.filter((t) => t.id !== ticketToDelete))
      toast.success("Ticket supprimé", {
        description: "Le ticket a été supprimé avec succès",
      })
    } catch (error: any) {
      console.error("❌ Erreur suppression ticket :", error)
      toast.error("Erreur de suppression", {
        description: "Impossible de supprimer le ticket",
      })
    } finally {
      setDeleteDialogOpen(false)
      setTicketToDelete(null)
    }
  }

  const startEdit = (ticket: Ticket) => {
    setEditingId(ticket.id)
    setFormData({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      type: ticket.type,
      status: ticket.status,
    })
    setEditDialogOpen(true)
  }

  const submitEdit = async () => {
    if (editingId === null) return

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Erreur d'authentification")
      return
    }

    // Validation des champs requis
    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast.error("Champs requis", {
        description: "Le titre et la description sont obligatoires",
      })
      return
    }

    try {
      setSaving(true)
      await axios.put(
        `http://localhost:8080/api/admin/tickets/${editingId}`,
        {
          ...formData,
          title: formData.title?.trim(),
          description: formData.description?.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Mettre à jour le ticket dans la liste locale
      setTickets(
        tickets.map((ticket) =>
          ticket.id === editingId ? { ...ticket, ...formData, updatedAt: new Date().toISOString() } : ticket,
        ),
      )

      toast.success("Ticket modifié", {
        description: "Les modifications ont été enregistrées",
      })

      setEditDialogOpen(false)
      setEditingId(null)
      setFormData({})
    } catch (error: any) {
      console.error("❌ Erreur modification ticket :", error)
      toast.error("Erreur de modification", {
        description: "Impossible de modifier le ticket",
      })
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditDialogOpen(false)
    setEditingId(null)
    setFormData({})
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterPriority("all")
    setFilterType("all")
    setFilterStatus("all")
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Administration des Tickets
          </h1>
          <p className="text-lg text-muted-foreground">Gestion complète des tickets de support</p>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtres et recherche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Première ligne - Recherche */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par titre, description ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchTickets} variant="outline" size="sm" className="shrink-0 bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>

            {/* Deuxième ligne - Filtres */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 items-center flex-wrap">
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
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

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{config.emoji}</span>
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{config.emoji}</span>
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
                {(searchTerm || filterPriority !== "all" || filterType !== "all" || filterStatus !== "all") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    <X className="w-3 h-3 mr-1" />
                    Effacer filtres
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => {
            const priorityInfo =
              priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.MOYENNE
            const typeInfo = typeConfig[ticket.type as keyof typeof typeConfig] || typeConfig.QUESTION
            const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.NOUVEAU

            return (
              <Card
                key={ticket.id}
                className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${priorityInfo.color} px-3 py-1`}>
                      <span className="mr-1">{priorityInfo.emoji}</span>
                      {priorityInfo.label}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusInfo.color} px-2 py-1 text-xs`}>
                        <span className="mr-1">{statusInfo.emoji}</span>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>

                  <CardTitle className="text-lg leading-tight mb-2 flex items-start gap-2">
                    <span className="text-lg">{typeInfo.emoji}</span>
                    <span className="flex-1 line-clamp-2">{ticket.title}</span>
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-3">{ticket.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Métadonnées */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Créé le {new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                    {ticket.updatedAt && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Settings className="w-3 h-3" />
                        <span>Modifié le {new Date(ticket.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {(ticket.userEmail || ticket.email) && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{ticket.userEmail || ticket.email}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog open={editDialogOpen && editingId === ticket.id} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => startEdit(ticket)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Edit3 className="w-5 h-5" />
                            Modifier le ticket #{ticket.id}
                          </DialogTitle>
                          <DialogDescription>
                            Modifiez les informations du ticket. Tous les champs marqués d'un * sont obligatoires.
                          </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="max-h-[60vh] pr-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="title" className="text-sm font-medium">
                                Titre *
                              </Label>
                              <Input
                                id="title"
                                value={formData.title || ""}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Titre du ticket"
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label htmlFor="description" className="text-sm font-medium">
                                Description *
                              </Label>
                              <Textarea
                                id="description"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description détaillée du ticket"
                                className="mt-1 min-h-[100px]"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="priority" className="text-sm font-medium">
                                  Priorité
                                </Label>
                                <Select
                                  value={formData.priority || ""}
                                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
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
                              </div>

                              <div>
                                <Label htmlFor="type" className="text-sm font-medium">
                                  Type
                                </Label>
                                <Select
                                  value={formData.type || ""}
                                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(typeConfig).map(([key, config]) => (
                                      <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                          <span>{config.emoji}</span>
                                          {config.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="status" className="text-sm font-medium">
                                  Statut
                                </Label>
                                <Select
                                  value={formData.status || ""}
                                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Sélectionner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                      <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                          <span>{config.emoji}</span>
                                          {config.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>

                        <DialogFooter className="gap-2">
                          <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                          </Button>
                          <Button onClick={submitEdit} disabled={saving}>
                            {saving ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            {saving ? "Enregistrement..." : "Enregistrer"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog
                      open={deleteDialogOpen && ticketToDelete === ticket.id}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => confirmDelete(ticket.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Confirmer la suppression
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer le ticket <strong>"{ticket.title}"</strong> ?
                            <br />
                            <span className="text-red-600 font-medium">Cette action est irréversible.</span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            <X className="w-4 h-4 mr-2" />
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={deleteTicket} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer définitivement
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Message si aucun ticket */}
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun ticket trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || filterPriority !== "all" || filterType !== "all" || filterStatus !== "all"
                ? "Essayez de modifier vos filtres de recherche"
                : "Aucun ticket n'a été créé pour le moment"}
            </p>
            {(searchTerm || filterPriority !== "all" || filterType !== "all" || filterStatus !== "all") && (
              <Button variant="outline" onClick={clearFilters} className="mt-4 bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Effacer les filtres
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
