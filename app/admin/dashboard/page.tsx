"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { toast } from "sonner"
import { useInView } from "framer-motion"
import { motion, AnimatePresence } from "framer-motion"
import {
  Ticket,
  Users,
  UserCheck,
  FileX,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  PieChartIcon,
  Trophy,
  Award,
  Crown,
  Sparkles,
} from "lucide-react"

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

type AgentStats = {
  agentId: number
  agentName: string
  email: string
  specialite: string
  averageRating: number
  ticketCount: number
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316", "#ec4899", "#06d6a0"]

export default function AdminDashboardFusion() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [agents, setAgents] = useState<AgentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showBestAgents, setShowBestAgents] = useState(false)
  const [bestAgentsLoading, setBestAgentsLoading] = useState(false)

  // Refs et useInView pour les animations des graphiques
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

  useEffect(() => {
    if (isEtatInView) setEtatKey((prev) => prev + 1)
  }, [isEtatInView])

  useEffect(() => {
    if (isDayInView) setDayKey((prev) => prev + 1)
  }, [isDayInView])

  useEffect(() => {
    if (isPriorityInView) setPriorityKey((prev) => prev + 1)
  }, [isPriorityInView])

  useEffect(() => {
    if (isTypeInView) setTypeKey((prev) => prev + 1)
  }, [isTypeInView])

  // Charger le dashboard et tous les agents au démarrage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")

        // Charger le dashboard
        const dashboardRes = await axios.get("http://localhost:8080/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setData(dashboardRes.data)

        // Charger tous les agents
        const agentsRes = await axios.get<AgentStats[]>("http://localhost:8080/api/admin/agents/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAgents(agentsRes.data)
      } catch (err) {
        toast.error("❌ Erreur lors du chargement des données : " + err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const showTopThreeAgents = () => {
    setBestAgentsLoading(true)

    // Simuler un petit délai pour l'effet visuel
    setTimeout(() => {
      setShowBestAgents(true)
      setBestAgentsLoading(false)
      toast.success("🏆 Top 3 des meilleurs agents affiché !")
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-red-600">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  const formatData = (map: Record<string, number>) =>
    Object.entries(map)
      .map(([key, value]) => ({ name: key, value }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())

  const formatMap = (map: Record<string, number>) => Object.entries(map).map(([key, value]) => ({ name: key, value }))

  // Top 3 agents par note et par tickets
  const topAgentsByRating = [...agents].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3)
  const topAgentsByTickets = [...agents].sort((a, b) => b.ticketCount - a.ticketCount).slice(0, 3)

  const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    suffix = "",
    trend,
  }: {
    title: string
    value: number | string
    icon: any
    gradient: string
    suffix?: string
    trend?: number
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
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {value}
          {suffix}
        </div>
        {trend && (
          <p className={`text-xs ${trend > 0 ? "text-emerald-600" : "text-red-600"} flex items-center mt-1`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend > 0 ? "+" : ""}
            {trend}% ce mois
          </p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-lg">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Administrateur
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Vue d'ensemble complète de votre système de gestion de tickets
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Total Tickets"
            value={data.totalTickets}
            icon={Ticket}
            gradient="from-blue-500 to-blue-600"
            trend={12}
          />
          <StatCard
            title="Utilisateurs"
            value={data.totalUsers}
            icon={Users}
            gradient="from-emerald-500 to-emerald-600"
            trend={8}
          />
          <StatCard
            title="Agents Actifs"
            value={data.activeAgents}
            icon={UserCheck}
            gradient="from-purple-500 to-purple-600"
            trend={5}
          />
          <StatCard
            title="Non Assignés"
            value={data.unassignedTickets}
            icon={FileX}
            gradient="from-amber-500 to-amber-600"
            trend={-15}
          />
          <StatCard
            title="Temps Moyen"
            value={data.avgResolutionTime}
            icon={Clock}
            gradient="from-red-500 to-red-600"
            suffix=" jours"
            trend={-8}
          />
          <StatCard
            title="Note Moyenne"
            value={data.avgClientRating}
            icon={Star}
            gradient="from-yellow-500 to-yellow-600"
            suffix=" / 5"
            trend={3}
          />
        </div>

        <Separator className="my-8" />

        {/* Tableau de tous les agents (affiché par défaut) */}
        {agents.length > 0 && !showBestAgents && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                <CardTitle className="text-xl flex items-center">
                  <Users className="h-6 w-6 mr-2" />📋 Tous les Agents ({agents.length})
                </CardTitle>
                <CardDescription className="text-slate-200">Liste complète de tous vos agents</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Spécialité</TableHead>
                      <TableHead className="text-center">Note Moyenne</TableHead>
                      <TableHead className="text-center">Tickets Résolus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent, index) => (
                      <motion.tr
                        key={agent.agentId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <TableCell className="font-medium">{agent.agentName}</TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{agent.specialite || "Aucune"}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {agent.averageRating != null ? agent.averageRating.toFixed(2) : "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{agent.ticketCount}</TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bouton pour afficher le top 3 */}
        <div className="flex justify-center">
          <Button
            onClick={showTopThreeAgents}
            disabled={bestAgentsLoading || showBestAgents}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bestAgentsLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyse en cours...
              </>
            ) : showBestAgents ? (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Top 3 Affiché
              </>
            ) : (
              <>
                <Trophy className="h-5 w-5 mr-2" />
                Afficher le Top 3 des Agents
              </>
            )}
          </Button>
        </div>

        {/* Section du top 3 des meilleurs agents */}
        <AnimatePresence>
          {showBestAgents && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
                  <CardHeader className="p-0">
                    <div className="flex items-center justify-center space-x-3">
                      <Crown className="h-8 w-8 text-white animate-pulse" />
                      <CardTitle className="text-white text-2xl font-bold">🏆 Top 3 des Meilleurs Agents</CardTitle>
                      <Sparkles className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <CardDescription className="text-yellow-100 text-center">
                      Le podium de vos champions support
                    </CardDescription>
                  </CardHeader>
                </div>
                <CardContent className="p-8">
                  {/* Top 3 par Note */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center">
                      <Award className="h-6 w-6 mr-2 text-green-600" />🌟 Top 3 par Note Moyenne
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {topAgentsByRating.map((agent, index) => (
                        <motion.div
                          key={`rating-${agent.agentId}`}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                          className="relative"
                        >
                          <div className="absolute -top-4 -left-4 z-10">
                            <div
                              className={`${
                                index === 0
                                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                  : index === 1
                                    ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                    : "bg-gradient-to-r from-orange-600 to-orange-700"
                              } text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div
                            className={`border-2 ${
                              index === 0
                                ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100"
                                : index === 1
                                  ? "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
                                  : "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100"
                            } p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                          >
                            <div className="space-y-3">
                              <p className="flex items-center text-lg font-semibold">
                                <span className="mr-2">👤</span> {agent.agentName}
                              </p>
                              <p className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">✉️</span> {agent.email}
                              </p>
                              <p className="flex items-center">
                                <span className="mr-2">🛠️</span> {agent.specialite || "Aucune"}
                              </p>
                              <div className="bg-white p-3 rounded-lg shadow-inner">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">⭐ Note</span>
                                  <span className="text-xl font-bold text-green-600">
                                    {agent.averageRating?.toFixed(2) || "—"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="font-semibold">📊 Tickets</span>
                                  <span className="text-lg font-bold text-blue-600">{agent.ticketCount}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Top 3 par Volume */}
                  <div>
                    <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center">
                      <Trophy className="h-6 w-6 mr-2 text-blue-600" />📈 Top 3 par Volume de Tickets
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {topAgentsByTickets.map((agent, index) => (
                        <motion.div
                          key={`tickets-${agent.agentId}`}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                          className="relative"
                        >
                          <div className="absolute -top-4 -left-4 z-10">
                            <div
                              className={`${
                                index === 0
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                  : index === 1
                                    ? "bg-gradient-to-r from-indigo-400 to-indigo-500"
                                    : "bg-gradient-to-r from-purple-600 to-purple-700"
                              } text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}
                            >
                              {index + 1}
                            </div>
                          </div>
                          <div
                            className={`border-2 ${
                              index === 0
                                ? "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
                                : index === 1
                                  ? "border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100"
                                  : "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100"
                            } p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                          >
                            <div className="space-y-3">
                              <p className="flex items-center text-lg font-semibold">
                                <span className="mr-2">👤</span> {agent.agentName}
                              </p>
                              <p className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">✉️</span> {agent.email}
                              </p>
                              <p className="flex items-center">
                                <span className="mr-2">🛠️</span> {agent.specialite || "Aucune"}
                              </p>
                              <div className="bg-white p-3 rounded-lg shadow-inner">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">📊 Tickets</span>
                                  <span className="text-xl font-bold text-blue-600">{agent.ticketCount}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="font-semibold">⭐ Note</span>
                                  <span className="text-lg font-bold text-green-600">
                                    {agent.averageRating?.toFixed(2) || "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator className="my-8" />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tickets par État */}
          <div ref={etatRef}>
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <CardHeader className="p-0">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-6 w-6 text-white" />
                    <CardTitle className="text-white text-xl">Tickets par État</CardTitle>
                  </div>
                  <CardDescription className="text-blue-100">Répartition des états des tickets</CardDescription>
                </CardHeader>
              </div>
              <CardContent className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%" key={etatKey}>
                  <BarChart data={formatMap(data.ticketsByEtat)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={5000}>
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
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                <CardHeader className="p-0">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-6 w-6 text-white" />
                    <CardTitle className="text-white text-xl">Tickets par Jour</CardTitle>
                  </div>
                  <CardDescription className="text-emerald-100">Volume quotidien des tickets</CardDescription>
                </CardHeader>
              </div>
              <CardContent className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%" key={dayKey}>
                  <AreaChart data={formatData(data.ticketsByDay)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorDay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorDay)"
                      strokeWidth={3}
                      isAnimationActive={true}
                      animationDuration={5000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tickets par Priorité */}
          <div ref={priorityRef}>
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                <CardHeader className="p-0">
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6 text-white" />
                    <CardTitle className="text-white text-xl">Tickets par Priorité</CardTitle>
                  </div>
                  <CardDescription className="text-purple-100">Distribution des priorités</CardDescription>
                </CardHeader>
              </div>
              <CardContent className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%" key={priorityKey}>
                  <PieChart>
                    <Pie
                      data={formatMap(data.ticketsByPriority)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      isAnimationActive={true}
                      animationDuration={5000}
                    >
                      {formatMap(data.ticketsByPriority).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tickets par Type */}
          <div ref={typeRef}>
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
                <CardHeader className="p-0">
                  <div className="flex items-center space-x-3">
                    <PieChartIcon className="h-6 w-6 text-white" />
                    <CardTitle className="text-white text-xl">Tickets par Type</CardTitle>
                  </div>
                  <CardDescription className="text-orange-100">Catégorisation des tickets</CardDescription>
                </CardHeader>
              </div>
              <CardContent className="h-80 p-6">
                <ResponsiveContainer width="100%" height="100%" key={typeKey}>
                  <PieChart>
                    <Pie
                      data={formatMap(data.ticketsByType)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      isAnimationActive={true}
                      animationDuration={5000}
                    >
                      {formatMap(data.ticketsByType).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
