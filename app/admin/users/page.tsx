"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trash2,
  Users,
  UserCheck,
  UserX,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Building,
  Calendar,
  Crown,
  Eye,
  Edit,
  RefreshCw,
  Download,
  Plus,
  Activity,
} from "lucide-react"

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  company: string
  isVerified: boolean
  lastLoginAt: string
  specialite?: string
}

const categories = [
  { value: "technical", label: "Technique", color: "bg-blue-100 text-blue-800" },
  { value: "account", label: "Compte", color: "bg-green-100 text-green-800" },
  { value: "billing", label: "Facturation", color: "bg-yellow-100 text-yellow-800" },
  { value: "feature", label: "Fonctionnalité", color: "bg-purple-100 text-purple-800" },
  { value: "bug", label: "Bug", color: "bg-red-100 text-red-800" },
  { value: "other", label: "Autre", color: "bg-gray-100 text-gray-800" },
]

const roleColors = {
  ADMIN: "bg-red-100 text-red-800 border-red-200",
  AGENT: "bg-blue-100 text-blue-800 border-blue-200",
  CLIENT: "bg-green-100 text-green-800 border-green-200",
}

const roleIcons = {
  ADMIN: Crown,
  AGENT: Shield,
  CLIENT: Users,
}

const BACKEND_URL = "http://localhost:8080"

export default function AdminUsersPage() {
  
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [verificationFilter, setVerificationFilter] = useState("ALL")
  const [specialites, setSpecialites] = useState<Record<number, string>>({})
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    email: string
    role: string
  } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)
  }, [])

  const fetchUsers = async (showRefreshing = false) => {
    if (!token) return

    if (showRefreshing) setRefreshing(true)

    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUsers(res.data)
      setFilteredUsers(res.data)
      if (showRefreshing) {
        toast.success("✅ Données actualisées")
      }
    } catch {
      toast.error("❌ Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
    }
  }

  const updateSpecialite = async (userId: number, specialite: string) => {
    if (!token) return
    try {
      await axios.put(
        `${BACKEND_URL}/api/admin/users/${userId}/specialite`,
        { specialite },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      toast.success("✅ Spécialité mise à jour")
      fetchUsers()
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.response?.data?.error || "❌ Erreur lors de la mise à jour"
      toast.error(errorMessage)
    }
  }

  const filterUsers = () => {
    let list = [...users]

    if (search.trim() !== "") {
      list = list.filter(
        (user) =>
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
          user.company?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (roleFilter !== "ALL") {
      list = list.filter((user) => user.role === roleFilter)
    }

    if (verificationFilter !== "ALL") {
      const isVerified = verificationFilter === "VERIFIED"
      list = list.filter((user) => user.isVerified === isVerified)
    }

    setFilteredUsers(list)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [token])

  useEffect(() => {
    filterUsers()
  }, [search, roleFilter, verificationFilter, users])

  const deleteUser = async (id: number) => {
    if (!token) return
    try {
      const res = await axios.delete(`${BACKEND_URL}/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success(res.data)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data || "❌ Erreur lors de la suppression")
    }
  }

  const confirmRoleChange = (email: string, newRole: string) => {
    setPendingRoleChange({ email, role: newRole })
  }

  const applyRoleChange = async () => {
    if (!pendingRoleChange || !token) return
    const { email, role } = pendingRoleChange
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/admin/users/role`,
        { email, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      toast.success(res.data)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data || "❌ Erreur lors du changement de rôle")
    } finally {
      setPendingRoleChange(null)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getCategoryInfo = (value: string) => {
    return categories.find((cat) => cat.value === value) || categories[categories.length - 1]
  }

  // Statistiques
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    agents: users.filter((u) => u.role === "AGENT").length,
    clients: users.filter((u) => u.role === "CLIENT").length,
    verified: users.filter((u) => u.isVerified).length,
    unverified: users.filter((u) => !u.isVerified).length,
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Chargement...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    description,
  }: {
    title: string
    value: number
    icon: any
    gradient: string
    description: string
  }) => (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-lg">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestion des Utilisateurs
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Gérez les utilisateurs, leurs rôles et leurs permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Total"
            value={stats.total}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
            description="Utilisateurs totaux"
          />
          <StatCard
            title="Administrateurs"
            value={stats.admins}
            icon={Crown}
            gradient="from-red-500 to-red-600"
            description="Rôle admin"
          />
          <StatCard
            title="Agents"
            value={stats.agents}
            icon={Shield}
            gradient="from-purple-500 to-purple-600"
            description="Rôle agent"
          />
          <StatCard
            title="Clients"
            value={stats.clients}
            icon={Users}
            gradient="from-green-500 to-green-600"
            description="Rôle client"
          />
          <StatCard
            title="Vérifiés"
            value={stats.verified}
            icon={UserCheck}
            gradient="from-emerald-500 to-emerald-600"
            description="Comptes vérifiés"
          />
          <StatCard
            title="Non Vérifiés"
            value={stats.unverified}
            icon={UserX}
            gradient="from-amber-500 to-amber-600"
            description="En attente"
          />
        </div>

        <Separator className="my-8" />

        {/* Filtres et Actions */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Filter className="h-6 w-6 mr-2" />
                  Filtres et Actions
                </CardTitle>
                <CardDescription className="text-slate-200">Recherchez et filtrez vos utilisateurs</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => fetchUsers(true)} disabled={refreshing} variant="secondary" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Actualiser
                </Button>
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email, entreprise..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les rôles</SelectItem>
                  <SelectItem value="CLIENT">CLIENT</SelectItem>
                  <SelectItem value="AGENT">AGENT</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut de vérification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous les statuts</SelectItem>
                  <SelectItem value="VERIFIED">Vérifiés</SelectItem>
                  <SelectItem value="UNVERIFIED">Non vérifiés</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
            <CardTitle className="text-xl flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-6 w-6 mr-2" />
                Utilisateurs ({filteredUsers.length})
              </div>
              <div className="text-sm font-normal">
                Page {currentPage} sur {totalPages}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence>
              {currentUsers.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-500">Aucun utilisateur trouvé</p>
                  <p className="text-gray-400 mt-2">Essayez de modifier vos filtres de recherche</p>
                </motion.div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {currentUsers.map((user, index) => {
                    const RoleIcon = roleIcons[user.role as keyof typeof roleIcons]
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {getInitials(user.firstName, user.lastName)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-lg">
                                  {user.firstName} {user.lastName}
                                </h3>
                                {user.isVerified ? (
                                  <UserCheck className="h-4 w-4 text-green-500" />
                                ) : (
                                  <UserX className="h-4 w-4 text-red-500" />
                                )}
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-1" />
                                  {user.email}
                                </div>
                                {user.company && (
                                  <div className="flex items-center">
                                    <Building className="h-4 w-4 mr-1" />
                                    {user.company}
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(user.lastLoginAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Badge de rôle */}
                            <div className="flex items-center space-x-2">
                              <Badge className={`${roleColors[user.role as keyof typeof roleColors]} border`}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {user.role}
                              </Badge>

                              {user.role === "AGENT" && user.specialite && (
                                <Badge className={getCategoryInfo(user.specialite).color}>
                                  {getCategoryInfo(user.specialite).label}
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              {/* Changement de rôle */}
                              <Select value={user.role} onValueChange={(value) => confirmRoleChange(user.email, value)}>
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CLIENT">CLIENT</SelectItem>
                                  <SelectItem value="AGENT">AGENT</SelectItem>
                                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Spécialité pour les agents */}
                              {user.role === "AGENT" && (
                                <Select
                                  value={specialites[user.id] || user.specialite}
                                  onValueChange={(value) => {
                                    setSpecialites((prev) => ({ ...prev, [user.id]: value }))
                                    updateSpecialite(user.id, value)
                                  }}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Spécialité" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((cat) => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}

                              {/* Menu d'actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Voir le profil
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer <strong>{user.email}</strong> ? Cette action
                                        est irréversible.
                                      </AlertDialogDescription>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteUser(user.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredUsers.length)} sur {filteredUsers.length}{" "}
                  utilisateurs
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AlertDialog confirmation de changement de rôle */}
        <AlertDialog open={!!pendingRoleChange} onOpenChange={() => setPendingRoleChange(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Changer le rôle</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir changer le rôle de <strong>{pendingRoleChange?.email}</strong> en{" "}
              <strong>{pendingRoleChange?.role}</strong> ? Cette action modifiera les permissions de l'utilisateur.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={applyRoleChange}>Confirmer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
