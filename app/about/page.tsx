import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Lightbulb, Award, Heart, Globe } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            À propos de nous
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Notre Mission</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Révolutionner la gestion des signalements et demandes utilisateurs grâce à l'intelligence artificielle et à
            une approche centrée sur l'expérience utilisateur.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Notre Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                Simplifier et optimiser la gestion des tickets en offrant une solution intelligente qui permet aux
                équipes de se concentrer sur ce qui compte vraiment : résoudre les problèmes des utilisateurs rapidement
                et efficacement.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Notre Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                Devenir la référence mondiale en matière de gestion intelligente des signalements, en créant un
                écosystème où l'IA et l'humain collaborent pour offrir une expérience utilisateur exceptionnelle.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Empathie</h3>
              <p className="text-muted-foreground">
                Nous comprenons les défis quotidiens des équipes support et développons des solutions qui répondent à
                leurs besoins réels.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Excellence</h3>
              <p className="text-muted-foreground">
                Nous nous engageons à fournir une qualité de service irréprochable et à améliorer continuellement notre
                plateforme.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Innovation</h3>
              <p className="text-muted-foreground">
                Nous repoussons constamment les limites de ce qui est possible avec l'IA pour créer des solutions
                révolutionnaires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
