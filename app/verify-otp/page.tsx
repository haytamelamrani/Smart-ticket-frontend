'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
import { Ticket, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) setEmail(emailParam)
  }, [searchParams])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setMessage("")

    try {
      const res = await axios.post("http://localhost:8080/api/auth/verify-otp", {
        email,
        otp,
      })

      setMessage(res.data)
      if (res.data.includes("✅")) {
        setTimeout(() => router.push("/signin"), 2500)
      }

    } catch (err: any) {
      setMessage(err.response?.data || "❌ Erreur lors de la vérification.")
    } finally {
      setIsVerifying(false)
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
          <h2 className="text-3xl font-bold text-foreground">Vérification du code</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Veuillez saisir le code reçu à l’adresse <strong>{email}</strong>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Confirmer votre adresse</CardTitle>
            <CardDescription>Code valide 10 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <Label htmlFor="otp">Code de vérification</Label>
                <Input
                  id="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Ex: 123456"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? "Vérification..." : "Vérifier le code"}
              </Button>

              {message && (
                <div className={`text-sm mt-2 ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
                  {message}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
