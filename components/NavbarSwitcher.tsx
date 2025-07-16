"use client"

import { useEffect, useState } from "react"
import { Navbar } from "./navbar"
import { UserNavbar } from "./userNavbar"
import { AdminNavbar } from "./AdminNavbar"
import { AgentrNavbar } from "./AgentNavbar"

export default function NavbarSwitcher() {
  const [role, setRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const readRoleFromStorage = () => {
    const token = localStorage.getItem("token")
    const storedRole = localStorage.getItem("role")
    if (token && storedRole) {
      setRole(storedRole)
    } else {
      setRole(null)
    }
  }

  useEffect(() => {
    readRoleFromStorage()
    setMounted(true)

    // 🔁 Écoute le custom event "authChange"
    window.addEventListener("authChange", readRoleFromStorage)

    return () => {
      window.removeEventListener("authChange", readRoleFromStorage)
    }
  }, [])

  if (!mounted) return null

  if (role === "ADMIN") return <AdminNavbar />
  if (role === "CLIENT") return <UserNavbar />
  if (role === "AGENT") return <AgentrNavbar />
  return <Navbar />
}
