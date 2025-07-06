"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  Star,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Activity
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Statistics {
  utilisateurs: {
    total: number
    actifs: number
    nouveaux_ce_mois: number
    tendance_utilisateurs: number
  }
  livres: {
    total: number
    disponibles: number
    empruntes: number
    reserves: number
    tendance_emprunts: number
  }
  emprunts: {
    total: number
    en_cours: number
    en_retard: number
    rendus_ce_mois: number
    tendance_retards: number
  }
  reservations: {
    total: number
    en_attente: number
    pretes: number
    expirees: number
    tendance_reservations: number
  }
  commentaires: {
    total: number
    en_attente: number
    approuves: number
    note_moyenne: number
    tendance_avis: number
  }
}

interface ChartData {
  emprunts_par_mois: Array<{ mois: string; nombre: number }>
  reservations_par_mois: Array<{ mois: string; nombre: number }>
  utilisateurs_par_mois: Array<{ mois: string; nombre: number }>
  livres_populaires: Array<{ titre: string; auteur: string; emprunts: number }>
  genres_populaires: Array<{ genre: string; nombre: number }>
}

interface ActivityData {
  activites_recentes: Array<{
    id: string
    type: 'emprunt' | 'retour' | 'reservation' | 'commentaire'
    description: string
    date: string
    utilisateur: string
  }>
}

export default function AdminAnalyticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [activityData, setActivityData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [stats, charts, activity] = await Promise.all([
        adminApi.getStatistics(period).catch(err => {
          console.error('Erreur stats:', err)
          return {}
        }),
        adminApi.getChartData(period).catch(err => {
          console.error('Erreur charts:', err)
          return {}
        }),
        adminApi.getActivityData(period).catch(err => {
          console.error('Erreur activity:', err)
          return {}
        })
      ])
      
      // Données par défaut si les endpoints ne fonctionnent pas encore
      setStatistics(stats || {
        utilisateurs: { actifs: 0, nouveaux_ce_mois: 0, tendance_utilisateurs: 0 },
        emprunts: { en_cours: 0, en_retard: 0, tendance_retards: 0 },
        reservations: { en_attente: 0, pretes: 0, tendance_reservations: 0 },
        commentaires: { total: 0, note_moyenne: 0, tendance_avis: 0 }
      })
      
      setChartData(charts || {
        livres_populaires: [],
        genres_populaires: [],
        emprunts_par_mois: [],
        reservations_par_mois: [],
        utilisateurs_par_mois: []
      })
      
      setActivityData(activity || {
        activites_recentes: []
      })
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
      // Données par défaut en cas d'erreur
      setStatistics({
        utilisateurs: { actifs: 0, nouveaux_ce_mois: 0, tendance_utilisateurs: 0 },
        emprunts: { en_cours: 0, en_retard: 0, tendance_retards: 0 },
        reservations: { en_attente: 0, pretes: 0, tendance_reservations: 0 },
        commentaires: { total: 0, note_moyenne: 0, tendance_avis: 0 }
      })
      setChartData({
        livres_populaires: [],
        genres_populaires: [],
        emprunts_par_mois: [],
        reservations_par_mois: [],
        utilisateurs_par_mois: []
      })
      setActivityData({
        activites_recentes: []
      })
    } finally {
      setLoading(false)
    }
  }

  const getTrendBadge = (trend: number) => {
    if (trend > 0) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <ArrowUp className="h-3 w-3 mr-1" />
          +{trend}%
        </Badge>
      )
    } else if (trend < 0) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <ArrowDown className="h-3 w-3 mr-1" />
          {trend}%
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline">
          0%
        </Badge>
      )
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'emprunt':
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case 'retour':
        return <BookOpen className="h-4 w-4 text-green-600" />
      case 'reservation':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'commentaire':
        return <Star className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const exportData = async () => {
    try {
      const data = await adminApi.exportAnalytics(period)
      // Créer un fichier CSV/Excel à télécharger
      const blob = new Blob([data], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_${period}days.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      alert('Erreur lors de l\'export des données')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
            Analytiques et Statistiques
          </h1>
          <p className="text-gray-600 mt-1">
            Tableau de bord des performances et statistiques de la bibliothèque
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">3 derniers mois</SelectItem>
              <SelectItem value="365">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={fetchAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.utilisateurs?.actifs || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.utilisateurs?.nouveaux_ce_mois || 0} nouveaux ce mois
                  </p>
                </div>
                <div className="text-right">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  {getTrendBadge(statistics.utilisateurs?.tendance_utilisateurs || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emprunts en cours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.emprunts?.en_cours || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.emprunts?.en_retard || 0} en retard
                  </p>
                </div>
                <div className="text-right">
                  <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                  {getTrendBadge(statistics.emprunts?.tendance_retards || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Réservations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.reservations?.en_attente || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.reservations?.pretes || 0} prêtes
                  </p>
                </div>
                <div className="text-right">
                  <Clock className="h-8 w-8 text-yellow-600 mb-2" />
                  {getTrendBadge(statistics.reservations?.tendance_reservations || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.commentaires?.note_moyenne?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.commentaires?.total || 0} avis
                  </p>
                </div>
                <div className="text-right">
                  <Star className="h-8 w-8 text-purple-600 mb-2" />
                  {getTrendBadge(statistics.commentaires?.tendance_avis || 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Message informatif si pas de données */}
      {(!chartData?.livres_populaires?.length && !chartData?.genres_populaires?.length && !activityData?.activites_recentes?.length) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Analytics en développement</h3>
                <p className="text-blue-700 mb-4">
                  Les endpoints d'analytics ne sont pas encore implémentés côté backend.
                  Les statistiques de base sont affichées, mais les graphiques détaillés seront disponibles prochainement.
                </p>
                <Button onClick={fetchAnalytics} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Livres populaires */}
        {chartData && chartData.livres_populaires && (
          <Card>
            <CardHeader>
              <CardTitle>Livres les plus empruntés</CardTitle>
              <CardDescription>
                Top 10 des livres les plus demandés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.livres_populaires.slice(0, 10).map((livre, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{livre.titre}</p>
                        <p className="text-sm text-gray-600">{livre.auteur}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{livre.emprunts}</p>
                      <p className="text-xs text-gray-500">emprunts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Genres populaires */}
        {chartData && chartData.genres_populaires && (
          <Card>
            <CardHeader>
              <CardTitle>Genres les plus demandés</CardTitle>
              <CardDescription>
                Répartition des emprunts par genre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.genres_populaires.map((genre, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <span className="font-medium">{genre.genre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ 
                            width: `${(genre.nombre / Math.max(...chartData.genres_populaires.map(g => g.nombre))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{genre.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Évolution temporelle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {chartData && chartData.emprunts_par_mois && (
          <Card>
            <CardHeader>
              <CardTitle>Emprunts par mois</CardTitle>
              <CardDescription>
                Évolution des emprunts sur la période
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chartData.emprunts_par_mois.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.mois}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-600 rounded-full"
                          style={{ 
                            width: `${chartData.emprunts_par_mois.length > 0 ? (item.nombre / Math.max(...chartData.emprunts_par_mois.map(e => e.nombre))) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{item.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {chartData && chartData.reservations_par_mois && (
          <Card>
            <CardHeader>
              <CardTitle>Réservations par mois</CardTitle>
              <CardDescription>
                Évolution des réservations sur la période
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chartData.reservations_par_mois.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.mois}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-yellow-600 rounded-full"
                          style={{ 
                            width: `${chartData.reservations_par_mois.length > 0 ? (item.nombre / Math.max(...chartData.reservations_par_mois.map(r => r.nombre))) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{item.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {chartData && chartData.utilisateurs_par_mois && (
          <Card>
            <CardHeader>
              <CardTitle>Nouveaux utilisateurs</CardTitle>
              <CardDescription>
                Évolution des inscriptions par mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chartData.utilisateurs_par_mois.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.mois}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-600 rounded-full"
                          style={{ 
                            width: `${chartData.utilisateurs_par_mois.length > 0 ? (item.nombre / Math.max(...chartData.utilisateurs_par_mois.map(u => u.nombre))) * 100 : 0}%`                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold">{item.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activité récente */}
      {activityData && activityData.activites_recentes && (
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières actions effectuées dans la bibliothèque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityData.activites_recentes.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {activity.utilisateur} • {new Date(activity.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
