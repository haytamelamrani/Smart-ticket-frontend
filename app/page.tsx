"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-background to-emerald-50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              <Brain className="w-4 h-4 mr-2" />
              Propulsé par l'Intelligence Artificielle
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Smart Ticket</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              L'outil intelligent de traitement des signalements et demandes utilisateurs
            </p>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Centralisez, automatisez et optimisez la gestion de vos tickets avec l'aide de l'IA pour une expérience
              utilisateur exceptionnelle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Découvrir les fonctionnalités
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Pourquoi choisir Smart Ticket ?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une solution complète qui révolutionne la gestion de vos signalements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">IA Intelligente</h3>
                <p className="text-muted-foreground">
                  Regroupement automatique des tickets similaires, détection d'urgences et suggestions de réponses
                  pertinentes
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Traitement Rapide</h3>
                <p className="text-muted-foreground">
                  Priorisation automatique et traitement accéléré pour une résolution efficace des demandes
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Collaboration</h3>
                <p className="text-muted-foreground">
                  Favorise le travail d'équipe entre modération, support et développement
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">85%</div>
              <p className="text-muted-foreground">Réduction du temps de traitement</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">95%</div>
              <p className="text-muted-foreground">Satisfaction utilisateur</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">70%</div>
              <p className="text-muted-foreground">Automatisation des réponses</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 dark:bg-green-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à transformer votre gestion des tickets ?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Rejoignez des milliers d'entreprises qui font confiance à Smart Ticket
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Démarrer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
