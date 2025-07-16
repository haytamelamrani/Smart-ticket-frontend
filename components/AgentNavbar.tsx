"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LogOut, Menu, Ticket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AgentrNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthenticated(localStorage.getItem("token") !== null)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    window.dispatchEvent(new Event("authChange"))
    router.push("/signin")
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-green-600 dark:text-green-400" />
            <span className="font-bold text-lg text-foreground">Smart Ticket</span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium">
                  Tickets
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link
                    href="/AllTickets"
                    className={pathname === "/AllTickets" ? "text-green-600 font-semibold" : ""}
                  >
                    Tous les tickets
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/Agent/AssignedTickets"
                    className={pathname === "/Agent/AssignedTickets" ? "text-green-600 font-semibold" : ""}
                  >
                    Mes Tickets assignés
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/Agent/Tickets"
                    className={pathname === "/Agent/Tickets" ? "text-green-600 font-semibold" : ""}
                  >
                    ma spécialité
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/Message"
              className={`text-sm font-medium hover:text-green-600 dark:hover:text-green-400 ${
                pathname === "/Message" ? "text-green-600 font-semibold" : "text-muted-foreground"
              }`}
            >
              Messagerie
            </Link>

            <Link
              href="/SimilarTicketsPage"
              className={`text-sm font-medium hover:text-green-600 dark:hover:text-green-400 ${
                pathname === "/SimilarTicketsPage" ? "text-green-600 font-semibold" : "text-muted-foreground"
              }`}
            >
              SimilarTickets
            </Link>

            <Link
              href="/Historique"
              className={`text-sm font-medium hover:text-green-600 dark:hover:text-green-400 ${
                pathname === "/Historique" ? "text-green-600 font-semibold" : "text-muted-foreground"
              }`}
            >
              Historique
            </Link>
          </div>

          {/* Auth / Logout desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="ghost">Se connecter</Button>
                </Link>
                <Link href="/signup">
                  <Button>S'inscrire</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 border-t border-border pt-2 space-y-2">
            <div className="px-4">
              <span className="block text-sm font-medium">Tickets</span>
              <div className="ml-2 space-y-1">
                <Link href="/AllTickets" onClick={() => setIsMenuOpen(false)} className="block text-sm hover:text-green-600 dark:hover:text-green-400">
                  Tous les tickets
                </Link>
                <Link href="/Agent/AssignedTickets" onClick={() => setIsMenuOpen(false)} className="block text-sm hover:text-green-600 dark:hover:text-green-400">
                  Tickets assignés
                </Link>
                <Link href="/Agent/Tickets" onClick={() => setIsMenuOpen(false)} className="block text-sm hover:text-green-600 dark:hover:text-green-400">
                  Tickets par spécialité
                </Link>
              </div>
            </div>

            <Link href="/Message" className="block px-4 py-2 text-sm font-medium hover:text-green-600 dark:hover:text-green-400" onClick={() => setIsMenuOpen(false)}>
              Messagerie
            </Link>
            <Link href="/SimilarTicketsPage" className="block px-4 py-2 text-sm font-medium hover:text-green-600 dark:hover:text-green-400" onClick={() => setIsMenuOpen(false)}>
              SimilarTickets
            </Link>
            <Link href="/Historique" className="block px-4 py-2 text-sm font-medium hover:text-green-600 dark:hover:text-green-400" onClick={() => setIsMenuOpen(false)}>
              Historique
            </Link>

            <div className="border-t border-border mt-2 px-4 py-2">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="ghost" className="w-full">Se connecter</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full mt-2">S'inscrire</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
