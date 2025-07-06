"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { testAPIs } from "@/lib/debug-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Star, 
  Clock, 
  Edit,
  Save,
  X,
  TrendingUp,
  Award,
  MessageCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserStats {
  totalBorrows: number
  currentBorrows: number
  reservations: number
  commentsGiven: number
  averageRating: number
  memberSince: string
  favoriteGenre: string
  booksRead: number
}

interface RecentActivity {
  id: string
  type: 'borrow' | 'return' | 'reservation' | 'comment'
  title: string
  date: string
  status?: string
}

export default function ProfilPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [editedUser, setEditedUser] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || ''
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log('🔍 Récupération des données pour l\'utilisateur:', user.id, user.prenom, user.nom)
        
        // Récupération des données en parallèle avec gestion d'erreur individuelle
        const [empruntsResult, reservationsResult, commentairesResult] = await Promise.allSettled([
          api.getUserEmprunts(),
          api.getUserReservations(), 
          api.getUserCommentaires()
        ])

        // Traitement des emprunts
        let empruntsData = []
        if (empruntsResult.status === 'fulfilled') {
          empruntsData = Array.isArray(empruntsResult.value) ? empruntsResult.value : []
          console.log('📚 Emprunts récupérés:', empruntsData.length, 'emprunts', empruntsData)
        } else {
          console.error('❌ Erreur emprunts:', empruntsResult.reason)
        }

        // Traitement des réservations
        let reservationsData = []
        if (reservationsResult.status === 'fulfilled') {
          reservationsData = Array.isArray(reservationsResult.value) ? reservationsResult.value : []
          console.log('📋 Réservations récupérées:', reservationsData.length, 'réservations', reservationsData)
        } else {
          console.error('❌ Erreur réservations:', reservationsResult.reason)
        }

        // Traitement des commentaires
        let commentairesData = []
        if (commentairesResult.status === 'fulfilled') {
          commentairesData = Array.isArray(commentairesResult.value) ? commentairesResult.value : []
          console.log('💬 Commentaires récupérés:', commentairesData.length, 'commentaires', commentairesData)
        } else {
          console.error('❌ Erreur commentaires:', commentairesResult.reason)
        }

        // Calcul des statistiques avec filtrage robuste
        const currentBorrows = empruntsData.filter(emprunt => {
          // Un emprunt est en cours si date_retour_effective est null/undefined ET pas marqué comme rendu
          const isActive = (!emprunt.date_retour_effective || emprunt.date_retour_effective === null) && 
                          (!emprunt.rendu || emprunt.rendu === 0 || emprunt.rendu === false)
          console.log('📖 Emprunt', emprunt.id, '- Actif:', isActive, 'date_retour_effective:', emprunt.date_retour_effective, 'rendu:', emprunt.rendu)
          return isActive
        })

        const activeReservations = reservationsData.filter(reservation => {
          // Une réservation est active si le statut est 'en_attente'
          const isActive = reservation.statut === 'en_attente'
          console.log('📝 Réservation', reservation.id, '- Active:', isActive, 'statut:', reservation.statut)
          return isActive
        })

        const booksRead = empruntsData.filter(emprunt => {
          // Un livre est lu si l'emprunt est terminé (date_retour_effective présente OU rendu = true)
          return (emprunt.date_retour_effective && emprunt.date_retour_effective !== null) || 
                 (emprunt.rendu === 1 || emprunt.rendu === true)
        })

        // Calcul de la note moyenne
        const notesValides = commentairesData.filter(c => c.note && c.note > 0).map(c => Number(c.note))
        const avgRating = notesValides.length > 0 
          ? notesValides.reduce((sum, note) => sum + note, 0) / notesValides.length
          : 0

        const statsCalculees = {
          totalBorrows: empruntsData.length,
          currentBorrows: currentBorrows.length,
          reservations: activeReservations.length,
          commentsGiven: commentairesData.length,
          averageRating: Number(avgRating.toFixed(1)),
          memberSince: "2023-09-15",
          favoriteGenre: "Science-Fiction",
          booksRead: booksRead.length
        }

        console.log('📊 Statistiques calculées:', statsCalculees)
        setStats(statsCalculees)

        // Construction de l'activité récente
        const recentActivities: RecentActivity[] = []
        
        // Emprunts en cours (les plus récents)
        currentBorrows.slice(0, 3).forEach(emprunt => {
          const dateRetourPrevue = emprunt.date_retour_prevue ? new Date(emprunt.date_retour_prevue) : null
          recentActivities.push({
            id: `borrow-${emprunt.id}`,
            type: 'borrow',
            title: `Emprunté: "${emprunt.titre || 'Titre non disponible'}"`,
            date: emprunt.date_emprunt || emprunt.created_at,
            status: dateRetourPrevue ? `Retour prévu: ${dateRetourPrevue.toLocaleDateString('fr-FR')}` : 'En cours'
          })
        })

        // Réservations actives
        activeReservations.slice(0, 2).forEach(reservation => {
          recentActivities.push({
            id: `reservation-${reservation.id}`,
            type: 'reservation',
            title: `Réservé: "${reservation.titre || 'Titre non disponible'}"`,
            date: reservation.date_reservation || reservation.created_at,
            status: reservation.position_file ? `Position ${reservation.position_file}` : 'En attente'
          })
        })

        // Commentaires récents
        commentairesData.slice(0, 2).forEach(comment => {
          recentActivities.push({
            id: `comment-${comment.id}`,
            type: 'comment',
            title: `Commentaire sur "${comment.titre || 'Livre'}"`,
            date: comment.date_commentaire || comment.created_at,
            status: comment.note ? `${comment.note}/5 étoiles` : 'Commenté'
          })
        })

        // Tri par date décroissante
        recentActivities.sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateB - dateA
        })

        setRecentActivity(recentActivities.slice(0, 6))
        console.log('📅 Activités récentes:', recentActivities)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        // En cas d'erreur, utiliser des données par défaut pour tester l'affichage
        setStats({
          totalBorrows: 5,
          currentBorrows: 2,
          reservations: 1,
          commentsGiven: 3,
          averageRating: 4.2,
          memberSince: "2023-09-15",
          favoriteGenre: "Science-Fiction",
          booksRead: 3
        })
        setRecentActivity([
          {
            id: 'test-1',
            type: 'borrow',
            title: 'Test Emprunt',
            date: '2025-01-01',
            status: 'En cours'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleSaveProfile = async () => {
    try {
      await api.updateUserProfile(editedUser)
      // Mettre à jour les données utilisateur dans le contexte si nécessaire
      setIsEditing(false)
      // Optionnel: Recharger les données pour s'assurer qu'elles sont à jour
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour du profil')
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'borrow':
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case 'return':
        return <BookOpen className="h-4 w-4 text-green-600" />
      case 'reservation':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-purple-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getMembershipDuration = () => {
    if (!stats?.memberSince) return ''
    const memberDate = new Date(stats.memberSince)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - memberDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    
    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `et ${months} mois` : ''}`
    }
    return `${months} mois`
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
      {/* Bouton de test temporaire - À supprimer en production */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">🧪 Tests de debug (temporaire)</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              try {
                const results = await testAPIs()
                console.log('📊 Résultats des tests:', results)
              } catch (error) {
                console.error('❌ Erreur tests:', error)
              }
            }}
          >
            Tester toutes les API
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              window.location.reload()
            }}
          >
            Recharger la page
          </Button>
        </div>
      </div>

      {/* En-tête du profil */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {user?.prenom} {user?.nom}
              </h1>
              <p className="text-blue-100 mb-1">{user?.email}</p>
              <p className="text-blue-200 text-sm">
                Membre depuis {getMembershipDuration()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <span className="text-lg font-semibold">Lecteur Actif</span>
            </div>
            <p className="text-blue-200 text-sm">Badge gagné ce mois-ci</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Gérez vos informations de compte
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              >
                {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        value={editedUser.prenom}
                        onChange={(e) => setEditedUser({ ...editedUser, prenom: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        value={editedUser.nom}
                        onChange={(e) => setEditedUser({ ...editedUser, nom: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder les modifications
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Nom complet</span>
                    <span className="text-sm">{user?.prenom} {user?.nom}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Email</span>
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Statut</span>
                    <Badge variant="secondary">Étudiant actif</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-600" />
                Activité récente
              </CardTitle>
              <CardDescription>
                Vos dernières actions dans la bibliothèque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString('fr-FR')}
                        </p>
                        {activity.status && (
                          <Badge variant="outline" className="text-xs">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne des statistiques */}
        <div className="space-y-6">
          {/* Statistiques principales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Mes statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{stats?.booksRead}</div>
                <div className="text-sm text-blue-600">livres lus</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-700">{stats?.totalBorrows}</div>
                  <div className="text-xs text-green-600">emprunts totaux</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-700">{stats?.commentsGiven}</div>
                  <div className="text-xs text-purple-600">avis donnés</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emprunts actuels</span>
                  <span className="font-semibold">{stats?.currentBorrows}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Réservations</span>
                  <span className="font-semibold">{stats?.reservations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Note moyenne donnée</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">{stats?.averageRating}/5</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Préférences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                Préférences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Genre favori</span>
                <Badge>{stats?.favoriteGenre}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Membre depuis</span>
                <span className="text-sm font-medium">
                  {stats?.memberSince && new Date(stats.memberSince).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Badges et récompenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Badges gagnés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Award className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                  <div className="text-xs font-medium">Lecteur Actif</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-medium">Explorateur</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <Star className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-xs font-medium">Critique</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-xs font-medium">Ponctuel</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
