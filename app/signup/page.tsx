'use client'

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Ticket, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const password = formData.get("password")?.toString()
    const confirmPassword = formData.get("confirmPassword")?.toString()

    if (password !== confirmPassword) {
      setError("❌ Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password,
      company: formData.get("company")
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      const text = await res.text()
      let result

      try {
        result = JSON.parse(text)
      } catch {
        result = { message: text || "Réponse vide du serveur" }
      }

      if (!res.ok || result.message?.startsWith("❌")) {
        throw new Error(result.message || "Erreur inconnue lors de l'inscription")
      }

      // ✅ Redirection si succès
      router.push(`/verify-otp?email=${data.email}`)
    } catch (err: any) {
      console.error("❌ Erreur capturée :", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("❌ Erreur inconnue : " + JSON.stringify(err, null, 2))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <Ticket className="h-10 w-10 text-green-600 dark:text-green-400" />
            <span className="font-bold text-2xl text-foreground">Smart Ticket</span>
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Créer votre compte</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ou{" "}
            <Link href="/signin" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500">
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-100 border border-red-300 px-4 py-2 rounded-md">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
            <CardDescription>Rejoignez des milliers d'entreprises qui utilisent Smart Ticket</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" name="firstName" type="text" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" name="lastName" type="text" required />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div>
                <Label htmlFor="company">Entreprise</Label>
                <Input id="company" name="company" type="text" required />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p className="mb-2">Votre mot de passe doit contenir :</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Au moins 8 caractères</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Une lettre majuscule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Un chiffre</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm leading-5">
                  J'accepte les{" "}
                  <Link href="#" className="text-green-600 hover:text-green-500">
                    conditions d'utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link href="#" className="text-green-600 hover:text-green-500">
                    politique de confidentialité
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Création du compte..." : "Créer mon compte"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
