"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LogOut, Menu, Ticket, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../theme-toggle"

export function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthenticated(localStorage.getItem("token") !== null)
    }
  }, [])

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Utilisateurs" },
    { href: "/admin/Tickets", label: "Tickets" },
    { href: "/Message", label: "Messages" },
    { href: "/SimilarTicketsPage", label: "SimilarTickets" },
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("email")
    window.dispatchEvent(new Event("authChange")) // 🔁 Met à jour NavbarSwitcher
    setIsAuthenticated(false)
    router.push("/signin")
  }
  

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-green-600 dark:text-green-400" />
            <span className="font-bold text-lg text-foreground">Smart Ticket Admin</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-green-600 dark:hover:text-green-400 ${
                  pathname === item.href
                    ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 pb-1"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated && (
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 border-t border-border pt-2 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm font-medium hover:text-green-600 dark:hover:text-green-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-border mt-2 px-4 py-2">
              {isAuthenticated && (
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
