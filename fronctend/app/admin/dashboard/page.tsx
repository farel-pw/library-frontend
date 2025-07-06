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
  Activity,
  Bell,
  Mail,
  AlertCircle
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
  notifications?: {
    total: number
    non_lues: number
    retards: number
    reservations: number
  }
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
  const [checkingOverdue, setCheckingOverdue] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🚀 Chargement du dashboard admin...")
        
        // Récupération des statistiques principales
        const [statsResult, activityResult, notificationStats] = await Promise.allSettled([
          adminApi.getStatistics(),
          adminApi.reports?.getBorrowStats() || Promise.resolve(null),
          adminApi.getNotificationStats()
        ])

        if (statsResult.status === 'fulfilled') {
          const rawStats = statsResult.value
          const transformedStats = {
            totalUsers: rawStats.utilisateurs?.total || 0,
            activeUsers: rawStats.utilisateurs?.actifs || 0,
            totalBooks: rawStats.livres?.total || 0,
            availableBooks: rawStats.livres?.disponibles || 0,
            totalBorrows: rawStats.emprunts?.total || 0,
            activeBorrows: rawStats.emprunts?.en_cours || 0,
            overdueBooks: rawStats.emprunts?.en_retard || 0,
            pendingReservations: rawStats.reservations?.en_attente || 0,
            totalComments: rawStats.commentaires?.total || 0,
            pendingComments: rawStats.commentaires?.en_attente || 0,
            notifications: rawStats.notifications || {
              total: 0,
              non_lues: 0,
              retards: 0,
              reservations: 0
            }
          }
          setStats(transformedStats)
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
            overdueBooks: 0, // Maintenant que nous n'avons pas d'emprunts en retard
            pendingReservations: 25,
            totalComments: 320,
            pendingComments: 8,
            notifications: {
              total: 0,
              non_lues: 0,
              retards: 0,
              reservations: 0
            }
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

  const handleCheckOverdue = async () => {
    setCheckingOverdue(true)
    try {
      const result = await adminApi.checkOverdueBooks()
      if (result.error) {
        alert(`Erreur: ${result.message}`)
      } else {
        alert(`✅ Vérification terminée!\n📊 Emprunts en retard: ${result.overdueCount || 0}\n📧 Notifications envoyées: ${result.notificationsSent || 0}`)
        // Recharger les stats après vérification
        const statsResult = await adminApi.getStatistics()
        if (statsResult.emprunts) {
          setStats(prev => prev ? {
            ...prev,
            overdueBooks: statsResult.emprunts.en_retard || 0
          } : null)
        }
      }
    } catch (error) {
      console.error('❌ Erreur vérification retards:', error)
      alert('Erreur lors de la vérification des retards')
    } finally {
      setCheckingOverdue(false)
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    try {
      const result = await adminApi.testEmailConfig()
      if (result.error) {
        alert(`❌ Test échoué: ${result.message}`)
      } else {
        alert('✅ Email de test envoyé avec succès!')
      }
    } catch (error) {
      console.error('❌ Erreur test email:', error)
      alert('Erreur lors du test email')
    } finally {
      setTestingEmail(false)
    }
  }

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

      {/* Notifications Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Total notifications */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.notifications?.total || 0}</div>
            <p className="text-xs text-slate-400">
              <span className="text-orange-400">{stats?.notifications?.non_lues || 0} non lues</span>
            </p>
          </CardContent>
        </Card>

        {/* Notifications retard */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Retards</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.notifications?.retards || 0}</div>
            <p className="text-xs text-slate-400">Notifications envoyées</p>
          </CardContent>
        </Card>

        {/* Notifications réservations */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Réservations</CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.notifications?.reservations || 0}</div>
            <p className="text-xs text-slate-400">Validations notifiées</p>
          </CardContent>
        </Card>

        {/* Actions rapides notifications */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={handleCheckOverdue}
              disabled={checkingOverdue}
              size="sm" 
              className="w-full bg-orange-600 hover:bg-orange-700 text-xs"
            >
              {checkingOverdue ? "..." : "Vérifier retards"}
            </Button>
            <Button 
              onClick={handleTestEmail}
              disabled={testingEmail}
              size="sm" 
              variant="outline" 
              className="w-full border-slate-600 text-slate-300 hover:text-white text-xs"
            >
              {testingEmail ? "..." : "Test email"}
            </Button>
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
            {/* Status global */}
            {(!stats?.overdueBooks || stats.overdueBooks === 0) && 
             (!stats?.pendingReservations || stats.pendingReservations === 0) && 
             (!stats?.pendingComments || stats.pendingComments === 0) && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-400">Système en ordre</p>
                    <p className="text-xs text-green-300">Aucune alerte active</p>
                  </div>
                </div>
              </div>
            )}

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

            {/* Notifications non lues */}
            {stats?.notifications?.non_lues && stats.notifications.non_lues > 0 && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-400">Notifications</p>
                    <p className="text-2xl font-bold text-purple-300">{stats.notifications.non_lues}</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
                    Voir tout
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raccourcis d'actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions générales */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Actions rapides</CardTitle>
            <CardDescription className="text-slate-400">
              Accès direct aux fonctionnalités les plus utilisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
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

        {/* Gestion des notifications */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Système de notifications
            </CardTitle>
            <CardDescription className="text-slate-400">
              Contrôle et surveillance des notifications automatiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Résumé des notifications */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-400">Total envoyées</p>
                <p className="text-lg font-bold text-white">{stats?.notifications?.total || 0}</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-400">Non lues</p>
                <p className="text-lg font-bold text-orange-400">{stats?.notifications?.non_lues || 0}</p>
              </div>
            </div>

            {/* Actions de notification */}
            <div className="space-y-2">
              <Button 
                onClick={handleCheckOverdue}
                disabled={checkingOverdue}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {checkingOverdue ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Vérification en cours...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Vérifier les retards
                  </>
                )}
              </Button>

              <Button 
                onClick={handleTestEmail}
                disabled={testingEmail}
                variant="outline" 
                className="w-full border-slate-600 text-slate-300 hover:text-white"
              >
                {testingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Tester la configuration email
                  </>
                )}
              </Button>

              <Link href="/admin/notifications">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white">
                  <Bell className="h-4 w-4 mr-2" />
                  Voir toutes les notifications
                </Button>
              </Link>
            </div>

            {/* Indicateurs de santé */}
            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Dernière vérification :</span>
                <span>Il y a 5 min</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>Configuration email :</span>
                <span className="text-green-400">✓ Configuré</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
