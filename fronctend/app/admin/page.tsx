"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react"
import { adminApi } from "@/lib/admin-api"

interface DashboardStats {
  total_livres: number
  livres_disponibles: number
  total_utilisateurs: number
  utilisateurs_actifs: number
  nouveaux_utilisateurs: number
  total_emprunts: number
  emprunts_actifs: number
  emprunts_en_retard: number
  emprunts_semaine: number
  total_reservations: number
  reservations_en_attente: number
  reservations_pretes: number
  total_commentaires: number
  commentaires_semaine: number
  note_moyenne_generale: string
  total_notifications: number
  notifications_non_lues: number
  notifications_retard: number
  notifications_reservations: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await adminApi.getStats()
        console.log("📊 Dashboard stats received:", data)
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("❌ Error fetching dashboard stats:", err)
        setError(err instanceof Error ? err.message : "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Tableau de bord administrateur
          </h1>
          <p className="text-slate-400">Chargement des données...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Tableau de bord administrateur
          </h1>
          <p className="text-red-400">Erreur: {error}</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Tableau de bord administrateur
          </h1>
          <p className="text-slate-400">Aucune donnée disponible</p>
        </div>
      </div>
    )
  }

  const dashboardStats = [
    {
      title: "Utilisateurs totaux",
      value: stats.total_utilisateurs.toString(),
      icon: Users,
      change: `${stats.nouveaux_utilisateurs} nouveaux`,
      changeType: "positive"
    },
    {
      title: "Livres en stock",
      value: stats.total_livres.toString(),
      icon: BookOpen,
      change: `${stats.livres_disponibles} disponibles`,
      changeType: "positive"
    },
    {
      title: "Emprunts actifs",
      value: stats.emprunts_actifs.toString(),
      icon: Clock,
      change: `${stats.emprunts_en_retard} en retard`,
      changeType: stats.emprunts_en_retard > 0 ? "negative" : "positive"
    },
    {
      title: "Réservations",
      value: stats.total_reservations.toString(),
      icon: Calendar,
      change: `${stats.reservations_pretes} prêtes`,
      changeType: "positive"
    }
  ]

  const recentActivities = [
    { type: "borrow", message: "Nouvel emprunt: 'Le Petit Prince'", time: "Il y a 5 min" },
    { type: "return", message: "Retour: '1984' par Jean Dupont", time: "Il y a 15 min" },
    { type: "reservation", message: "Nouvelle réservation: 'Harry Potter'", time: "Il y a 1h" },
    { type: "comment", message: "Nouveau commentaire sur 'Dune'", time: "Il y a 2h" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Tableau de bord administrateur
        </h1>
        <p className="text-slate-400">
          Vue d'ensemble de votre bibliothèque
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Commentaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total_commentaires}</div>
            <p className="text-xs text-green-400">{stats.commentaires_semaine} cette semaine</p>
            <p className="text-xs text-slate-400">Note moyenne: {stats.note_moyenne_generale}/5</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total_notifications}</div>
            <p className="text-xs text-red-400">{stats.notifications_retard} retards</p>
            <p className="text-xs text-blue-400">{stats.notifications_reservations} réservations</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Activité</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.emprunts_semaine}</div>
            <p className="text-xs text-green-400">Emprunts cette semaine</p>
            <p className="text-xs text-slate-400">{stats.utilisateurs_actifs} utilisateurs actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Activités récentes</CardTitle>
            <CardDescription className="text-slate-400">
              Les dernières actions dans votre bibliothèque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">{activity.message}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Actions rapides</CardTitle>
            <CardDescription className="text-slate-400">
              Raccourcis vers les fonctions principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 border-slate-600 hover:bg-slate-700"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Gérer les utilisateurs</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 border-slate-600 hover:bg-slate-700"
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Ajouter un livre</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 border-slate-600 hover:bg-slate-700"
              >
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">Voir les rapports</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2 border-slate-600 hover:bg-slate-700"
              >
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Modérer les avis</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>État du système</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">Base de données</p>
                <p className="text-xs text-slate-400">Opérationnelle</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">API</p>
                <p className="text-xs text-slate-400">En ligne</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">Sauvegardes</p>
                <p className="text-xs text-slate-400">Dernière: il y a 2h</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}