"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.text()
      
      if (response.ok) {
        setSuccess(true)
      } else {
        alert("Erreur : " + data)
      }      
    } catch (err) {
      // Gérer les erreurs ici
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
          <h2 className="text-3xl font-bold text-foreground">Mot de passe oublié ?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Réinitialiser votre mot de passe</CardTitle>
            <CardDescription>
              Nous vous enverrons un lien par email pour créer un nouveau mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Email envoyé !</h3>
                <p className="text-muted-foreground mb-4">
                  Si {email} est associé à un compte, vous recevrez bientôt un email avec les instructions.
                </p>
                <Button asChild className="w-full">
                  <Link href="/login">Retour à la connexion</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="relative mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </Button>
                
                <div className="text-center text-sm mt-4">
                  <Link 
                    href="/signin" 
                    className="font-medium text-green-600 dark:text-green-400 hover:text-green-500"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}