"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Ticket, Eye, EyeOff } from "lucide-react"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })
  const [mounted, setMounted] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // Évite les erreurs d'hydratation SSR/CSR

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        mode: "cors",
        credentials: "include", // si backend utilise des cookies ou sessions
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : {}

      if (!res.ok || data.error) {
        const message = data.error || (res.status === 401
          ? "Email ou mot de passe incorrect"
          : res.status === 403
          ? "Accès interdit"
          : "Erreur inconnue")
        setError(message)
      } else {
        localStorage.setItem("token", data.token)
        localStorage.setItem("email", form.email)
        localStorage.setItem("role", data.role)
        window.dispatchEvent(new Event("authChange"))        
        router.push("/create-ticket")
      }
    } catch (err: any) {
      console.error("❌ Erreur de connexion :", err)
      setError("Erreur réseau. Vérifie que le backend fonctionne.")
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
          <h2 className="text-3xl font-bold text-foreground">Connexion à votre compte</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ou{" "}
            <Link href="/signup" className="font-medium text-green-600 dark:text-green-400 hover:text-green-500">
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Se connecter</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder à votre espace Smart Ticket</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Votre mot de passe"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgetpassword"
                    className="font-medium text-green-600 dark:text-green-400 hover:text-green-500"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
