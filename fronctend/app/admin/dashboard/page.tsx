"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity
} from "lucide-react"
import { adminApi } from "@/lib/admin-api"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalBooks: number
  availableBooks: number
  totalBorrows: number
  activeBorrows: number
  overdueBooks: number
  pendingReservations: number
  totalComments: number
  pendingComments: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  user?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🚀 Chargement du dashboard admin...")
        
        // Récupération des statistiques principales
        const [statsResult, activityResult] = await Promise.allSettled([
          adminApi.getStats(),
          adminApi.reports.getBorrowStats()
        ])

        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value)
        } else {
          console.error("❌ Erreur stats:", statsResult.reason)
          // Données de démonstration
          setStats({
            totalUsers: 150,
            activeUsers: 142,
            totalBooks: 2500,
            availableBooks: 2350,
            totalBorrows: 450,
            activeBorrows: 89,
            overdueBooks: 12,
            pendingReservations: 25,
            totalComments: 320,
            pendingComments: 8
          })
        }

        // Activité récente simulée
        setRecentActivity([
          {
            id: "1",
            type: "borrow",
            description: "Nouvel emprunt: 'Clean Code' par Martin Dubois",
            timestamp: new Date().toISOString(),
            user: "Martin Dubois"
          },
          {
            id: "2", 
            type: "user",
            description: "Nouvel utilisateur inscrit: Sophie Laurent",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            user: "Sophie Laurent"
          },
          {
            id: "3",
            type: "return",
            description: "Retour: 'JavaScript Guide' par Jean Dupont",
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            user: "Jean Dupont"
          },
          {
            id: "4",
            type: "comment",
            description: "Nouveau commentaire sur 'Python Programming'",
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            user: "Alice Martin"
          }
        ])

      } catch (error) {
        console.error("❌ Erreur dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'borrow':
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case 'return':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'user':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)} h`
    return `Il y a ${Math.floor(diffMins / 1440)} j`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord administrateur</h1>
          <p className="text-slate-400">Vue d'ensemble de la bibliothèque universitaire</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapports
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <Activity className="h-4 w-4 mr-2" />
            Actions rapides
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Utilisateurs */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsers}</div>
            <p className="text-xs text-slate-400">
              <span className="text-green-400">{stats?.activeUsers} actifs</span>
            </p>
          </CardContent>
        </Card>

        {/* Livres */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Livres</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalBooks}</div>
            <p className="text-xs text-slate-400">
              <span className="text-green-400">{stats?.availableBooks} disponibles</span>
            </p>
          </CardContent>
        </Card>

        {/* Emprunts */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Emprunts</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.activeBorrows}</div>
            <p className="text-xs text-slate-400">
              <span className="text-red-400">{stats?.overdueBooks} en retard</span>
            </p>
          </CardContent>
        </Card>

        {/* Réservations */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Réservations</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.pendingReservations}</div>
            <p className="text-xs text-slate-400">En attente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              Activité récente
            </CardTitle>
            <CardDescription className="text-slate-400">
              Dernières actions dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-slate-400">{formatTimeAgo(activity.timestamp)}</p>
                      {activity.user && (
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {activity.user}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertes et notifications */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Livres en retard */}
            {stats?.overdueBooks && stats.overdueBooks > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-400">Livres en retard</p>
                    <p className="text-2xl font-bold text-red-300">{stats.overdueBooks}</p>
                  </div>
                  <Link href="/admin/borrows?filter=overdue">
                    <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
                      Gérer
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Réservations en attente */}
            {stats?.pendingReservations && stats.pendingReservations > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Réservations</p>
                    <p className="text-2xl font-bold text-yellow-300">{stats.pendingReservations}</p>
                  </div>
                  <Link href="/admin/reservations">
                    <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20">
                      Traiter
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Commentaires à modérer */}
            {stats?.pendingComments && stats.pendingComments > 0 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-400">Commentaires</p>
                    <p className="text-2xl font-bold text-blue-300">{stats.pendingComments}</p>
                  </div>
                  <Link href="/admin/comments?filter=pending">
                    <Button size="sm" variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/20">
                      Modérer
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raccourcis d'actions */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Actions rapides</CardTitle>
          <CardDescription className="text-slate-400">
            Accès direct aux fonctionnalités les plus utilisées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/books/new">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white h-16 flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                <span className="text-sm">Ajouter un livre</span>
              </Button>
            </Link>
            
            <Link href="/admin/users/new">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white h-16 flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Nouvel utilisateur</span>
              </Button>
            </Link>

            <Link href="/admin/borrows/new">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white h-16 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                <span className="text-sm">Nouvel emprunt</span>
              </Button>
            </Link>

            <Link href="/admin/reports">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white h-16 flex-col">
                <BarChart3 className="h-6 w-6 mb-2" />
                <span className="text-sm">Voir rapports</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
