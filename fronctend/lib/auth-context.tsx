"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getApiUrl, API_CONFIG } from "./api-config"

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: "etudiant" | "admin"
}

interface RegisterResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<RegisterResult>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  nom: string
  prenom: string
  email: string
  password: string
  studentId?: string
  department?: string
  role?: "etudiant" | "admin"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        return true
      }
      return false
    } catch (error) {
      console.error("Erreur de connexion:", error)
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REGISTER), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
      
      const data = await response.json()
      
      if (response.ok && !data.error) {
        return { success: true }
      } else {
        const errorMsg = data?.message || "Erreur lors de l'inscription"
        return { success: false, error: errorMsg }
      }
    } catch (error: any) {
      console.error("Erreur d'inscription:", error)
      return { success: false, error: "Impossible de se connecter au serveur" }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
