import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import NavbarSwitcher from "@/components/NavbarSwitcher" // ce fichier sera client

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Ticket - Outil intelligent de traitement des signalements",
  description:
    "Système centralisé et intelligent pour collecter, traiter et gérer les signalements utilisateurs avec l'aide de l'IA",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NavbarSwitcher /> {/* <- c'est ici qu'on bascule navbar dynamiquement */}
          <main>{children}</main>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
