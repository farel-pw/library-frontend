"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface AdminUser {
  id: number
  nom: string
  prenom: string
  email: string
  role: "admin"
  permissions: string[]
}

interface AdminAuthContextType {
  adminUser: AdminUser | null
  adminToken: string | null
  login: (credentials: any) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'admin est déjà connecté
    const savedToken = localStorage.getItem("adminToken")
    const savedUser = localStorage.getItem("adminUser")

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setAdminUser(user)
        setAdminToken(savedToken)
      } catch (error) {
        console.error("Erreur lors de la récupération des données admin:", error)
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminUser")
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials: any): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        setAdminUser(data.user)
        setAdminToken(data.token)
        localStorage.setItem("adminToken", data.token)
        localStorage.setItem("adminUser", JSON.stringify(data.user))
        return true
      }
      return false
    } catch (error) {
      console.error("Erreur lors de la connexion admin:", error)
      return false
    }
  }

  const logout = () => {
    setAdminUser(null)
    setAdminToken(null)
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, adminToken, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
