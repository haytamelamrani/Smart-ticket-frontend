'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { toast } from 'sonner'
import { useInView } from 'framer-motion'

interface DashboardData {
  totalTickets: number
  ticketsByEtat: Record<string, number>
  ticketsByDay: Record<string, number>
  totalUsers: number
  activeAgents: number
  unassignedTickets: number
  avgResolutionTime: number
  ticketsByPriority: Record<string, number>
  ticketsByType: Record<string, number>
  avgClientRating: number
}

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f87171', '#a78bfa', '#fb923c', '#f472b6', '#4ade80']

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // Refs et useInView
  const etatRef = useRef(null)
  const dayRef = useRef(null)
  const priorityRef = useRef(null)
  const typeRef = useRef(null)

  const isEtatInView = useInView(etatRef)
  const isDayInView = useInView(dayRef)
  const isPriorityInView = useInView(priorityRef)
  const isTypeInView = useInView(typeRef)

  const [etatKey, setEtatKey] = useState(0)
  const [dayKey, setDayKey] = useState(0)
  const [priorityKey, setPriorityKey] = useState(0)
  const [typeKey, setTypeKey] = useState(0)

  useEffect(() => { if (isEtatInView) setEtatKey(prev => prev + 1) }, [isEtatInView])
  useEffect(() => { if (isDayInView) setDayKey(prev => prev + 1) }, [isDayInView])
  useEffect(() => { if (isPriorityInView) setPriorityKey(prev => prev + 1) }, [isPriorityInView])
  useEffect(() => { if (isTypeInView) setTypeKey(prev => prev + 1) }, [isTypeInView])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('http://localhost:8080/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(res.data)
      } catch (err) {
        toast.error("❌ Erreur dashboard admin : " + err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) return <div className="p-8">Chargement...</div>
  if (!data) return <div className="p-8 text-red-500">Aucune donnée</div>

  const formatMap = (map: Record<string, number>) =>
    Object.entries(map).map(([key, value]) => ({ name: key, value }))

  return (
    <div className="p-8 space-y-6 bg-background min-h-screen">
      <h1 className="text-2xl font-bold">📊 Dashboard Administrateur</h1>
      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card><CardHeader><CardTitle>✅ Total Tickets</CardTitle></CardHeader><CardContent>{data.totalTickets}</CardContent></Card>
        <Card><CardHeader><CardTitle>🧍 Total Utilisateurs</CardTitle></CardHeader><CardContent>{data.totalUsers}</CardContent></Card>
        <Card><CardHeader><CardTitle>🧑‍💻 Agents Actifs</CardTitle></CardHeader><CardContent>{data.activeAgents}</CardContent></Card>
        <Card><CardHeader><CardTitle>🗂️ Tickets non assignés</CardTitle></CardHeader><CardContent>{data.unassignedTickets}</CardContent></Card>
        <Card><CardHeader><CardTitle>🕒 Temps moyen de traitement</CardTitle></CardHeader><CardContent>{data.avgResolutionTime} jours</CardContent></Card>
        <Card><CardHeader><CardTitle>⭐ Note Moyenne Client</CardTitle></CardHeader><CardContent>{data.avgClientRating} / 5</CardContent></Card>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tickets par État */}
        <div ref={etatRef}>
          <Card>
            <CardHeader>
              <CardTitle>📈 Tickets par État</CardTitle>
              <CardDescription>Répartition des états</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%" key={etatKey}>
                <BarChart data={formatMap(data.ticketsByEtat)}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" isAnimationActive={true} animationDuration={800}>
                    {formatMap(data.ticketsByEtat).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tickets par Jour */}
        <div ref={dayRef}>
          <Card>
            <CardHeader>
              <CardTitle>📅 Tickets par Jour</CardTitle>
              <CardDescription>Volume quotidien</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%" key={dayKey}>
                <BarChart data={formatMap(data.ticketsByDay)}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" isAnimationActive={true} animationDuration={800}>
                    {formatMap(data.ticketsByDay).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tickets par Priorité */}
        <div ref={priorityRef}>
          <Card>
            <CardHeader>
              <CardTitle>🧾 Tickets par Priorité</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%" key={priorityKey}>
                <PieChart>
                  <Pie
                    data={formatMap(data.ticketsByPriority)}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    isAnimationActive={true}
                    animationDuration={800}
                  >
                    {formatMap(data.ticketsByPriority).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tickets par Type */}
        <div ref={typeRef}>
          <Card>
            <CardHeader>
              <CardTitle>🌍 Tickets par Type</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%" key={typeKey}>
                <PieChart>
                  <Pie
                    data={formatMap(data.ticketsByType)}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    isAnimationActive={true}
                    animationDuration={800}
                  >
                    {formatMap(data.ticketsByType).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
