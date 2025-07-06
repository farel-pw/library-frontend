"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, Star, Clock, TrendingUp, Users, Award, ChevronRight } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalBooks: number
  availableBooks: number
  myBorrows: number
  myReservations: number
  myComments: number
  avgRating: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('🏠 Chargement des statistiques de l\'accueil...')
        
        // Récupération des données en parallèle avec gestion d'erreur
        const [livresResult, empruntsResult, reservationsResult, commentairesResult] = await Promise.allSettled([
          api.getLivres(),
          api.getUserEmprunts(),
          api.getUserReservations(),
          api.getUserCommentaires()
        ])

        // Traitement sécurisé des livres
        let livresData = []
        if (livresResult.status === 'fulfilled') {
          livresData = Array.isArray(livresResult.value) ? livresResult.value : []
        }

        // Traitement sécurisé des emprunts
        let empruntsData = []
        if (empruntsResult.status === 'fulfilled') {
          empruntsData = Array.isArray(empruntsResult.value) ? empruntsResult.value : []
        }

        // Traitement sécurisé des réservations
        let reservationsData = []
        if (reservationsResult.status === 'fulfilled') {
          reservationsData = Array.isArray(reservationsResult.value) ? reservationsResult.value : []
        }

        // Traitement sécurisé des commentaires
        let commentairesData = []
        if (commentairesResult.status === 'fulfilled') {
          commentairesData = Array.isArray(commentairesResult.value) ? commentairesResult.value : []
        }

        // Calcul des statistiques avec la même logique que le profil
        const availableBooks = livresData.filter(livre => livre.disponible === 1 || livre.disponible === true).length
        const currentBorrows = empruntsData.filter(emprunt => 
          (!emprunt.date_retour_effective || emprunt.date_retour_effective === null) && 
          (!emprunt.rendu || emprunt.rendu === 0 || emprunt.rendu === false)
        ).length
        const activeReservations = reservationsData.filter(reservation => reservation.statut === 'en_attente').length
        
        const notesValides = commentairesData.filter(c => c.note && c.note > 0).map(c => Number(c.note))
        const avgRating = notesValides.length > 0 
          ? notesValides.reduce((sum, note) => sum + note, 0) / notesValides.length 
          : 0

        const statsCalculees = {
          totalBooks: livresData.length,
          availableBooks: availableBooks,
          myBorrows: currentBorrows,
          myReservations: activeReservations,
          myComments: commentairesData.length,
          avgRating: Number(avgRating.toFixed(1))
        }

        console.log('🏠 Statistiques accueil calculées:', statsCalculees)
        setStats(statsCalculees)
      } catch (error) {
        console.error('❌ Erreur lors du chargement des statistiques:', error)
        setStats({
          totalBooks: 0,
          availableBooks: 0,
          myBorrows: 0,
          myReservations: 0,
          myComments: 0,
          avgRating: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getTimeGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Bonjour"
    if (hour < 18) return "Bon après-midi"
    return "Bonsoir"
  }

  const getPersonalizedMessage = () => {
    const messages = [
      "Prêt pour une nouvelle aventure littéraire ?",
      "Découvrez nos dernières acquisitions !",
      "Votre prochaine lecture vous attend.",
      "Explorez de nouveaux horizons intellectuels.",
      "La connaissance n'attend que vous !",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Message de bienvenue personnalisé */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white rounded-lg p-8 mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getTimeGreeting()}, {user?.prenom} ! 👋
            </h1>
            <p className="text-blue-100 text-lg mb-4">
              {getPersonalizedMessage()}
            </p>
            <p className="text-blue-200 text-sm">
              Aujourd'hui, {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <BookOpen className="h-24 w-24 text-blue-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Livres disponibles</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats?.availableBooks.toLocaleString()}</div>
            <p className="text-xs text-green-600">sur {stats?.totalBooks.toLocaleString()} livres</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Mes emprunts</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats?.myBorrows}</div>
            <p className="text-xs text-blue-600">livres empruntés</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Réservations</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats?.myReservations}</div>
            <p className="text-xs text-purple-600">en attente</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Ma note moyenne</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{stats?.avgRating}/5</div>
            <p className="text-xs text-yellow-600">{stats?.myComments} avis donnés</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Parcourir le catalogue
            </CardTitle>
            <CardDescription>
              Découvrez notre collection de livres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/livres">
              <Button className="w-full">
                Voir les livres
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Mes emprunts
            </CardTitle>
            <CardDescription>
              Gérez vos emprunts en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/emprunts">
              <Button variant="outline" className="w-full">
                Voir mes emprunts
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Donner un avis
            </CardTitle>
            <CardDescription>
              Partagez votre expérience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/avis">
              <Button variant="outline" className="w-full">
                Laisser un avis
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Informations utiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Nouveautés de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Romans contemporains</span>
                <span className="text-sm font-semibold text-blue-600">+12 livres</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sciences & Technologies</span>
                <span className="text-sm font-semibold text-blue-600">+8 livres</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Histoire & Géographie</span>
                <span className="text-sm font-semibold text-blue-600">+5 livres</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-red-600" />
              Rappels importants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Retour prévu dans 3 jours</p>
                  <p className="text-xs text-gray-600">Pour éviter les frais de retard</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Réservation disponible</p>
                  <p className="text-xs text-gray-600">Votre livre réservé est prêt</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
