"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

type Ticket = {
  id: number
  title: string
  description: string
  etat: string
  groupId?: number
}

export default function TicketGroupesPage() {
  const [groupes, setGroupes] = useState<Record<string, Ticket[]>>({})
  const [loading, setLoading] = useState(true)
  const seuil = 0.5 // tu peux le rendre dynamique si tu veux

  const fetchGroupedTickets = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`http://localhost:8080/api/tickets/groupes?seuil=${seuil}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setGroupes(res.data)
    } catch (error) {
      console.error("❌ Erreur de chargement :", error)
      toast.error("Erreur lors du chargement des tickets groupés")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupedTickets()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📂 Tickets groupés par similarité</h1>

      {loading ? (
        <p>Chargement...</p>
      ) : Object.keys(groupes).length === 0 ? (
        <p>Aucun groupe trouvé.</p>
      ) : (
        Object.entries(groupes).map(([groupId, tickets]) => (
          <div key={groupId} className="mb-6 border rounded-lg p-4 shadow bg-white dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-blue-600 mb-3">Groupe #{groupId}</h2>
            <ul className="space-y-3">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="border p-3 rounded bg-gray-100 dark:bg-gray-800">
                  <p><strong>Titre :</strong> {ticket.title}</p>
                  <p><strong>Description :</strong> {ticket.description}</p>
                  <p><strong>État :</strong> {ticket.etat}</p>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
