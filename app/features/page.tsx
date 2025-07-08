import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from  "@/components/ui/badge"
import {
  Brain,
  Zap,
  Users,
  BarChart3,
  Shield,
  MessageSquare,
  Clock,
  Filter,
  Bell,
  Archive,
  Search,
  Workflow,
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "IA Intelligente",
      description: "Regroupement automatique des tickets similaires et détection des urgences",
      details: [
        "Classification automatique par catégorie",
        "Détection des sentiments et urgences",
        "Suggestions de réponses personnalisées",
        "Apprentissage continu des patterns",
      ],
      color: "green",
    },
    {
      icon: Zap,
      title: "Traitement Rapide",
      description: "Priorisation intelligente et traitement accéléré des demandes",
      details: [
        "Priorisation automatique basée sur l'impact",
        "Routage intelligent vers les bonnes équipes",
        "Réponses automatiques pour les cas simples",
        "Escalade automatique si nécessaire",
      ],
      color: "emerald",
    },
    {
      icon: Users,
      title: "Collaboration d'Équipe",
      description: "Favorise le travail collaboratif entre toutes les équipes",
      details: [
        "Assignation automatique des tickets",
        "Commentaires et notes internes",
        "Historique complet des interactions",
        "Notifications en temps réel",
      ],
      color: "teal",
    },
    {
      icon: BarChart3,
      title: "Analytics Avancés",
      description: "Tableaux de bord et rapports détaillés pour optimiser les performances",
      details: [
        "Métriques de performance en temps réel",
        "Rapports de satisfaction client",
        "Analyse des tendances et patterns",
        "KPIs personnalisables",
      ],
      color: "orange",
    },
    {
      icon: Shield,
      title: "Sécurité Renforcée",
      description: "Protection des données et conformité aux standards de sécurité",
      details: ["Chiffrement end-to-end", "Authentification multi-facteurs", "Audit trail complet", "Conformité RGPD"],
      color: "red",
    },
    {
      icon: MessageSquare,
      title: "Communication Fluide",
      description: "Interface intuitive pour une communication efficace",
      details: ["Chat en temps réel", "Templates de réponses", "Support multicanal", "Interface mobile responsive"],
      color: "purple",
    },
  ]

  const additionalFeatures = [
    { icon: Clock, title: "Suivi en Temps Réel", description: "Monitoring continu de tous les tickets" },
    { icon: Filter, title: "Filtres Avancés", description: "Recherche et filtrage sophistiqués" },
    { icon: Bell, title: "Notifications Smart", description: "Alertes intelligentes et personnalisées" },
    { icon: Archive, title: "Archivage Automatique", description: "Gestion automatique du cycle de vie" },
    { icon: Search, title: "Recherche Sémantique", description: "Recherche basée sur le sens et le contexte" },
    { icon: Workflow, title: "Workflows Personnalisés", description: "Automatisation des processus métier" },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            Fonctionnalités
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Tout ce dont vous avez besoin</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez comment Smart Ticket révolutionne la gestion de vos signalements avec des fonctionnalités avancées
            et une IA de pointe.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            const colorClasses = {
              green: "bg-green-100 text-green-600 dark:text-green-400 dark:bg-green-900/30",
              emerald: "bg-emerald-100 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-900/30",
              teal: "bg-teal-100 text-teal-600 dark:text-teal-400 dark:bg-teal-900/30",
              orange: "bg-orange-100 text-orange-600 dark:text-orange-400 dark:bg-orange-900/30",
              red: "bg-red-100 text-red-600 dark:text-red-400 dark:bg-red-900/30",
              purple: "bg-purple-100 text-purple-600 dark:text-purple-400 dark:bg-purple-900/30",
            }

            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colorClasses[feature.color as keyof typeof colorClasses]}`}
                  >
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm text-muted-foreground flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Features */}
        <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-12">Et bien plus encore...</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="flex items-start space-x-4 p-4 bg-background rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Integration Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Intégrations Natives</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Smart Ticket s'intègre parfaitement avec vos outils existants
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2"></div>
              <span className="text-sm text-muted-foreground">Slack</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2"></div>
              <span className="text-sm text-muted-foreground">Teams</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2"></div>
              <span className="text-sm text-muted-foreground">Jira</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-2"></div>
              <span className="text-sm text-muted-foreground">Zendesk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
