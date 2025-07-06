"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [adminUser, setAdminUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si un admin est connecté
    const checkAdminAuth = () => {
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")
      
      if (token && user) {
        try {
          const userData = JSON.parse(user)
          if (userData.role === "admin") {
            setAdminUser(userData)
          } else {
            // Si ce n'est pas un admin, rediriger vers la connexion
            router.push("/admin/connexion")
          }
        } catch (error) {
          router.push("/admin/connexion")
        }
      } else {
        router.push("/admin/connexion")
      }
      setLoading(false)
    }

    checkAdminAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!adminUser) {
    return null // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminNavbar adminUser={adminUser} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
