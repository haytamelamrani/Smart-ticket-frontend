"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Trash2, ShieldCheck } from "lucide-react"

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  company: string
  isVerified: boolean
  lastLoginAt: string
}

const BACKEND_URL = "http://localhost:8080"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [pendingRoleChange, setPendingRoleChange] = useState<{ email: string, role: string } | null>(null)

  const token = localStorage.getItem("token")

  const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/admin/users")
      setUsers(res.data)
      setFilteredUsers(res.data)
    } catch {
      toast.error("❌ Erreur lors du chargement des utilisateurs")
    }
  }

  const filterUsers = () => {
    let list = [...users]

    if (search.trim() !== "") {
      list = list.filter(user => user.email.toLowerCase().includes(search.toLowerCase()))
    }

    if (roleFilter !== "ALL") {
      list = list.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(list)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [search, roleFilter, users])

  const deleteUser = async (id: number) => {
    try {
      const res = await axiosInstance.delete(`/api/admin/users/${id}`)
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
    if (!pendingRoleChange) return
    const { email, role } = pendingRoleChange

    try {
      const res = await axiosInstance.put("/api/admin/users/role", {
        email,
        role,
      })
      toast.success(res.data)
      fetchUsers()
    } catch (err: any) {
      toast.error(err.response?.data || "❌ Erreur lors du changement de rôle")
    } finally {
      setPendingRoleChange(null)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des Utilisateurs 👥</h2>

      {/* Filtres */}
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="🔍 Rechercher par email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72"
        />

        <Select defaultValue="ALL" onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les rôles</SelectItem>
            <SelectItem value="CLIENT">CLIENT</SelectItem>
            <SelectItem value="AGENT">AGENT</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-muted text-left">
              <th className="p-2">Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Entreprise</th>
              <th>Vérifié</th>
              <th>Dernière Connexion</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <Select defaultValue={user.role} onValueChange={(value) => confirmRoleChange(user.email, value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">CLIENT</SelectItem>
                      <SelectItem value="AGENT">AGENT</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td>{user.company || "—"}</td>
                <td>{user.isVerified ? "✅" : "❌"}</td>
                <td>{new Date(user.lastLoginAt).toLocaleString()}</td>
                <td>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                      <AlertDialogDescription>
                        Es-tu sûr de vouloir supprimer <strong>{user.email}</strong> ?
                      </AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteUser(user.id)}>Confirmer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">Aucun utilisateur trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* AlertDialog confirmation de changement de rôle */}
      <AlertDialog open={!!pendingRoleChange} onOpenChange={() => setPendingRoleChange(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Changer le rôle</AlertDialogTitle>
          <AlertDialogDescription>
            Es-tu sûr de vouloir changer le rôle de <strong>{pendingRoleChange?.email}</strong> en <strong>{pendingRoleChange?.role}</strong> ?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={applyRoleChange}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
