"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { BookOpen, User, LogOut, Home, Book, Calendar, MessageSquare, Star, Menu, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo principal */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Bibliothèque Universitaire</span>
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Accueil</span>
                  </Button>
                </Link>
                <Link href="/dashboard/livres">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Book className="h-4 w-4" />
                    <span>Livres</span>
                  </Button>
                </Link>
                <Link href="/dashboard/emprunts">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Emprunts</span>
                  </Button>
                </Link>
                <Link href="/dashboard/reservations">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Réservations</span>
                  </Button>
                </Link>
                <Link href="/dashboard/avis">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Avis</span>
                  </Button>
                </Link>

                {/* Menu utilisateur */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 ml-4">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:block">
                        {user.prenom} {user.nom}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profil" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Mon Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href="/connexion">
                  <Button variant="ghost">Connexion</Button>
                </Link>
                <Link href="/inscription">
                  <Button>Inscription</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Bouton menu mobile */}
          {user && (
            <div className="md:hidden flex items-center">
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}
        </div>

        {/* Menu mobile */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
              <Link href="/dashboard" className="block">
                <Button variant="ghost" className="w-full justify-start space-x-2" onClick={toggleMobileMenu}>
                  <Home className="h-4 w-4" />
                  <span>Accueil</span>
                </Button>
              </Link>
              <Link href="/dashboard/livres" className="block">
                <Button variant="ghost" className="w-full justify-start space-x-2" onClick={toggleMobileMenu}>
                  <Book className="h-4 w-4" />
                  <span>Livres</span>
                </Button>
              </Link>
              <Link href="/dashboard/emprunts" className="block">
                <Button variant="ghost" className="w-full justify-start space-x-2" onClick={toggleMobileMenu}>
                  <Calendar className="h-4 w-4" />
                  <span>Mes Emprunts</span>
                </Button>
              </Link>
              <Link href="/dashboard/reservations" className="block">
                <Button variant="ghost" className="w-full justify-start space-x-2" onClick={toggleMobileMenu}>
                  <Calendar className="h-4 w-4" />
                  <span>Réservations</span>
                </Button>
              </Link>
              <Link href="/dashboard/avis" className="block">
                <Button variant="ghost" className="w-full justify-start space-x-2" onClick={toggleMobileMenu}>
                  <Star className="h-4 w-4" />
                  <span>Avis</span>
                </Button>
              </Link>
              <Link href="/dashboard/profil" className="block">
                <Button variant="ghost" className="w-full justify-start space-x-2" onClick={toggleMobileMenu}>
                  <User className="h-4 w-4" />
                  <span>Mon Profil</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50" 
                onClick={() => {
                  logout()
                  toggleMobileMenu()
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
