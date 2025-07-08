"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    console.log("🔑 Token reçu depuis l'URL :", token)
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    console.log("🔐 Nouveau mot de passe entré :", newPassword)
    console.log("🔐 Confirmation :", confirmPassword)

    if (!token) {
      console.error("❌ Aucun token trouvé dans l'URL.")
      setError("❌ Lien invalide ou expiré")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      console.warn("⚠️ Les mots de passe ne correspondent pas.")
      setError("❌ Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      console.warn("⚠️ Le mot de passe est trop court.")
      setError("❌ Le mot de passe doit contenir au moins 8 caractères")
      setIsLoading(false)
      return
    }

    try {
      console.log("📡 Envoi de la requête à l'API reset-password...")
      const response = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      })

      const resultText = await response.text()

      console.log("📦 Status de la réponse :", response.status)
      console.log("📦 Contenu de la réponse :", resultText)

      if (response.ok) {
        console.log("✅ Mot de passe réinitialisé avec succès !")
        setSuccess("✅ Mot de passe réinitialisé avec succès !")
        setTimeout(() => router.push("/signin"), 3000)
      } else {
        console.error("❌ Échec du backend :", resultText)
        setError(resultText || "❌ Une erreur est survenue")
      }
    } catch (err: any) {
      console.error("❌ Erreur de connexion :", err)
      setError("❌ Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <Ticket className="h-10 w-10 text-green-600 dark:text-green-400" />
            <span className="font-bold text-2xl text-foreground">Smart Ticket</span>
          </Link>
          <h2 className="text-3xl font-bold text-foreground">Réinitialiser votre mot de passe</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link 
              href="/login" 
              className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la connexion
            </Link>
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Créer un nouveau mot de passe</CardTitle>
            <CardDescription>
              Votre nouveau mot de passe doit contenir au moins 8 caractères.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nouveau mot de passe */}
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmation */}
              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirmez votre mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Messages */}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Traitement..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
