"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, MessageCircle, TrendingUp, Users, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface BibliothequeCommentaire {
  id: number
  utilisateur_nom: string
  utilisateur_prenom: string
  commentaire: string
  note: number
  date_commentaire: string
}

interface BibliothequeStats {
  total_commentaires: number
  note_moyenne: number
  notes_positives: number
  notes_negatives: number
}

export default function AvisPage() {
  const [commentaires, setCommentaires] = useState<BibliothequeCommentaire[]>([])
  const [stats, setStats] = useState<BibliothequeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [nouveauCommentaire, setNouveauCommentaire] = useState("")
  const [nouvelleNote, setNouvelleNote] = useState(5)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [commentsData, statsData] = await Promise.all([
        api.getBibliothequeCommentaires(),
        api.getBibliothequeStats()
      ])
      setCommentaires(commentsData)
      setStats(statsData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les avis.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const ajouterCommentaire = async () => {
    if (!nouveauCommentaire.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un commentaire.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour laisser un avis.",
        variant: "destructive",
      })
      return
    }

    try {
      setEnvoiEnCours(true)
      const response = await api.ajouterBibliothequeCommentaire({
        commentaire: nouveauCommentaire,
        note: nouvelleNote
      })
      
      if (response.error) {
        toast({
          title: "Erreur",
          description: response.message || "Impossible d'ajouter votre avis.",
          variant: "destructive",
        })
        return
      }
      
      toast({
        title: "Succès",
        description: "Votre avis a été ajouté avec succès!",
      })
      
      setNouveauCommentaire("")
      setNouvelleNote(5)
      loadData()
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avis:", error)
      
      // Gestion spécifique pour les erreurs d'authentification
      if (error.message?.includes("401") || error.message?.includes("Session expirée")) {
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter.",
          variant: "destructive",
        })
        // Redirection gérée par apiCall
        return
      }
      
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter votre avis.",
        variant: "destructive",
      })
    } finally {
      setEnvoiEnCours(false)
    }
  }

  const renderStars = (note: number, taille: string = "h-4 w-4") => {
    const noteNumber = Number(note) || 0
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${taille} ${star <= noteNumber ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const renderInteractiveStars = (note: number, onChange: (note: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer ${star <= note ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement des avis...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Avis sur la Bibliothèque</h1>
        <p className="text-gray-600">Partagez votre expérience et consultez les avis des autres étudiants</p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.note_moyenne ? Number(stats.note_moyenne).toFixed(1) : "N/A"}
                  </p>
                  <div className="flex items-center space-x-2">
                    {stats.note_moyenne && renderStars(Number(stats.note_moyenne))}
                    <span className="text-sm text-gray-600">Note moyenne</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_commentaires}</p>
                  <p className="text-sm text-gray-600">Total avis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.notes_positives}</p>
                  <p className="text-sm text-gray-600">Avis positifs (4-5★)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_commentaires > 0 ? Math.round((stats.notes_positives / stats.total_commentaires) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulaire d'ajout d'avis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Laissez votre avis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Votre note</Label>
              <div className="mt-2">
                {renderInteractiveStars(nouvelleNote, setNouvelleNote)}
              </div>
            </div>
            <div>
              <Label htmlFor="commentaire" className="text-sm font-medium">
                Votre commentaire
              </Label>
              <Textarea
                id="commentaire"
                placeholder="Partagez votre expérience avec la bibliothèque..."
                value={nouveauCommentaire}
                onChange={(e) => setNouveauCommentaire(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <Button
              onClick={ajouterCommentaire}
              disabled={envoiEnCours}
              className="w-full md:w-auto"
            >
              {envoiEnCours ? "Envoi en cours..." : "Publier mon avis"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des avis */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Tous les avis ({commentaires.length})</h2>
        {commentaires.map((commentaire) => (
          <Card key={commentaire.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {commentaire.utilisateur_prenom} {commentaire.utilisateur_nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(commentaire.date_commentaire).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStars(commentaire.note)}
                  <Badge variant="outline">{commentaire.note}/5</Badge>
                </div>
              </div>
              <p className="text-gray-700">{commentaire.commentaire}</p>
            </CardContent>
          </Card>
        ))}

        {commentaires.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis pour le moment</h3>
            <p className="text-gray-600">Soyez le premier à laisser un avis sur notre bibliothèque!</p>
          </div>
        )}
      </div>
    </div>
  )
}
