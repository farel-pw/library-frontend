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
        adminApi.getStatistics(period),
        adminApi.getChartData(period),
        adminApi.getActivityData(period)
      ])
      
      setStatistics(stats)
      setChartData(charts)
      setActivityData(activity)
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
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
                  <p className="text-2xl font-bold text-gray-900">{statistics.utilisateurs.actifs}</p>
                  <p className="text-xs text-gray-500">
                    {statistics.utilisateurs.nouveaux_ce_mois} nouveaux ce mois
                  </p>
                </div>
                <div className="text-right">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  {getTrendBadge(statistics.utilisateurs.tendance_utilisateurs)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emprunts en cours</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.emprunts.en_cours}</p>
                  <p className="text-xs text-gray-500">
                    {statistics.emprunts.en_retard} en retard
                  </p>
                </div>
                <div className="text-right">
                  <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                  {getTrendBadge(statistics.emprunts.tendance_retards)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Réservations</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.reservations.en_attente}</p>
                  <p className="text-xs text-gray-500">
                    {statistics.reservations.pretes} prêtes
                  </p>
                </div>
                <div className="text-right">
                  <Clock className="h-8 w-8 text-yellow-600 mb-2" />
                  {getTrendBadge(statistics.reservations.tendance_reservations)}
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
                    {statistics.commentaires.note_moyenne?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {statistics.commentaires.total} avis
                  </p>
                </div>
                <div className="text-right">
                  <Star className="h-8 w-8 text-purple-600 mb-2" />
                  {getTrendBadge(statistics.commentaires.tendance_avis)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Livres populaires */}
        {chartData && (
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
        {chartData && (
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
        {chartData && (
          <>
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
                              width: `${(item.nombre / Math.max(...chartData.emprunts_par_mois.map(e => e.nombre))) * 100}%` 
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
                              width: `${(item.nombre / Math.max(...chartData.reservations_par_mois.map(r => r.nombre))) * 100}%` 
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
                              width: `${(item.nombre / Math.max(...chartData.utilisateurs_par_mois.map(u => u.nombre))) * 100}%` 
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
          </>
        )}
      </div>

      {/* Activité récente */}
      {activityData && (
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
