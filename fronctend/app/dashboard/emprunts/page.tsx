"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Fonction pour associer les livres aux images disponibles
const getImageForBook = (titre: string, auteur: string): string => {
  const titreNormalized = titre.toLowerCase()
  const auteurNormalized = auteur.toLowerCase()

  // Correspondances spécifiques par titre
  if (titreNormalized.includes("histoire") || titreNormalized.includes("temps")) return "/images/histoire du temps.png"
  if (titreNormalized.includes("comte") || titreNormalized.includes("monte-cristo")) return "/images/le comte de monte-cristo.png"
  if (titreNormalized.includes("kant") || titreNormalized.includes("critique")) return "/images/la critique de Kant.png"
  if (titreNormalized.includes("newton") || titreNormalized.includes("principe")) return "/images/principe newton.png"
  if (auteurNormalized.includes("victor hugo")) return "/images/victor hugo.png"
  if (auteurNormalized.includes("yuval noah")) return "/images/yuval noah.png"

  // Images par défaut
  if (titreNormalized.includes("petit prince")) return "/images/roman.png"
  if (titreNormalized.includes("1984")) return "/images/science1.png"
  if (titreNormalized.includes("étranger")) return "/images/la critique de Kant.png"
  if (titreNormalized.includes("misérables")) return "/images/victor hugo.png"
  if (titreNormalized.includes("madame bovary")) return "/images/roman1.png"
  if (titreNormalized.includes("seigneur")) return "/images/Litte.png"
  if (titreNormalized.includes("harry potter")) return "/images/Litte.png"

  return "/placeholder.jpg"
}

interface Emprunt {
  id: number
  livre_id: number
  titre: string
  auteur: string
  date_emprunt: string
  date_retour_prevue: string
  date_retour_effective: string | null
  rendu: boolean
  image_url?: string
}

export default function EmpruntsPage() {
  const [emprunts, setEmprunts] = useState<Emprunt[]>([])
  const [loading, setLoading] = useState(true)
  const [retourEnCours, setRetourEnCours] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadEmprunts()
  }, [])

  const loadEmprunts = async () => {
    try {
      const data = await api.getEmprunts()
      setEmprunts(data)
    } catch (error) {
      console.error("Erreur lors du chargement des emprunts:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos emprunts.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const retournerLivre = async (empruntId: number) => {
    try {
      setRetourEnCours(empruntId)
      await api.retournerLivre(empruntId)
      toast({
        title: "Retour réussi",
        description: "Le livre a été retourné avec succès.",
      })
      loadEmprunts() // Recharger la liste
    } catch (error) {
      console.error("Erreur lors du retour:", error)
      toast({
        title: "Erreur",
        description: "Impossible de retourner ce livre. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setRetourEnCours(null)
    }
  }

  const getStatutBadge = (emprunt: Emprunt) => {
    if (emprunt.rendu) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Retourné
        </Badge>
      )
    }

    const dateRetourPrevue = new Date(emprunt.date_retour_prevue)
    const maintenant = new Date()

    if (maintenant > dateRetourPrevue) {
      return <Badge variant="destructive">En retard</Badge>
    }

    return (
      <Badge variant="default" className="bg-blue-100 text-blue-800">
        En cours
      </Badge>
    )
  }

  const getStatutIcon = (emprunt: Emprunt) => {
    if (emprunt.rendu) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }

    const dateRetourPrevue = new Date(emprunt.date_retour_prevue)
    const maintenant = new Date()

    if (maintenant > dateRetourPrevue) {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }

    return <Clock className="h-5 w-5 text-blue-600" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const getJoursRestants = (dateRetourPrevue: string) => {
    const date = new Date(dateRetourPrevue)
    const maintenant = new Date()
    const diffTime = date.getTime() - maintenant.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMessageJoursRestants = (emprunt: Emprunt) => {
    if (emprunt.rendu) return null
    
    const joursRestants = getJoursRestants(emprunt.date_retour_prevue)
    
    if (joursRestants < 0) {
      return (
        <span className="text-red-600 font-medium">
          En retard de {Math.abs(joursRestants)} jour{Math.abs(joursRestants) > 1 ? 's' : ''}
        </span>
      )
    } else if (joursRestants === 0) {
      return <span className="text-orange-600 font-medium">À retourner aujourd'hui</span>
    } else if (joursRestants <= 3) {
      return (
        <span className="text-orange-600 font-medium">
          Plus que {joursRestants} jour{joursRestants > 1 ? 's' : ''}
        </span>
      )
    } else {
      return (
        <span className="text-green-600">
          {joursRestants} jour{joursRestants > 1 ? 's' : ''} restant{joursRestants > 1 ? 's' : ''}
        </span>
      )
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement de vos emprunts...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Emprunts</h1>
        <p className="text-gray-600">Gérez vos livres empruntés et leurs retours</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{emprunts.filter((e) => !e.rendu).length}</p>
                <p className="text-sm text-gray-600">Emprunts en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{emprunts.filter((e) => e.rendu).length}</p>
                <p className="text-sm text-gray-600">Livres retournés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {emprunts.filter((e) => !e.rendu && new Date(e.date_retour_prevue) < new Date()).length}
                </p>
                <p className="text-sm text-gray-600">En retard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des emprunts */}
      <div className="space-y-4">
        {emprunts.map((emprunt) => (
          <Card key={emprunt.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                  <img
                    src={getImageForBook(emprunt.titre, emprunt.auteur)}
                    alt={emprunt.titre}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      // Fallback si l'image ne se charge pas
                      (e.target as HTMLImageElement).src = "/placeholder.jpg"
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{emprunt.titre}</h3>
                      <p className="text-gray-600 mb-2">par {emprunt.auteur}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatutIcon(emprunt)}
                      {getStatutBadge(emprunt)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Emprunté le {formatDate(emprunt.date_emprunt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>À retourner le {formatDate(emprunt.date_retour_prevue)}</span>
                    </div>
                    {emprunt.date_retour_effective ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Retourné le {formatDate(emprunt.date_retour_effective)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {getMessageJoursRestants(emprunt)}
                      </div>
                    )}
                  </div>

                  {!emprunt.rendu && (
                    <Button 
                      onClick={() => retournerLivre(emprunt.id)} 
                      variant="outline"
                      disabled={retourEnCours === emprunt.id}
                    >
                      {retourEnCours === emprunt.id ? "Retour en cours..." : "Retourner le livre"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {emprunts.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun emprunt</h3>
          <p className="text-gray-600">Vous n'avez pas encore emprunté de livres.</p>
        </div>
      )}
    </div>
  )
}
