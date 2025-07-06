"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { LogOut, User, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminNavbarProps {
  adminUser: {
    nom: string
    prenom: string
    email: string
    role: string
  }
}

export function AdminNavbar({ adminUser }: AdminNavbarProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/admin/connexion")
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">
            Administration - Bibliothèque
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* User info */}
          <div className="flex items-center space-x-3 text-slate-300">
            <User className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-medium text-white">
                {adminUser.prenom} {adminUser.nom}
              </p>
              <p className="text-xs text-slate-400">
                {adminUser.email}
              </p>
            </div>
          </div>
          
          {/* Logout button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </nav>
  )
}