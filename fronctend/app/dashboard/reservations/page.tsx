"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, Clock, Users, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

// Fonction pour associer les livres aux images disponibles
const getImageForBook = (titre: string, auteur: string): string => {
  const titreNormalized = titre.toLowerCase()
  const auteurNormalized = auteur.toLowerCase()
  
  if (titreNormalized.includes("histoire") || titreNormalized.includes("temps")) return "/images/histoire du temps.png"
  if (titreNormalized.includes("comte") || titreNormalized.includes("monte-cristo")) return "/images/le comte de monte-cristo.png"
  if (titreNormalized.includes("kant") || titreNormalized.includes("critique")) return "/images/la critique de Kant.png"
  if (titreNormalized.includes("newton") || titreNormalized.includes("principe")) return "/images/principe newton.png"
  if (auteurNormalized.includes("victor hugo")) return "/images/victor hugo.png"
  if (auteurNormalized.includes("yuval noah")) return "/images/yuval noah.png"
  
  if (titreNormalized.includes("petit prince")) return "/images/roman.png"
  if (titreNormalized.includes("1984")) return "/images/science1.png"
  if (titreNormalized.includes("étranger")) return "/images/la critique de Kant.png"
  if (titreNormalized.includes("misérables")) return "/images/victor hugo.png"
  if (titreNormalized.includes("madame bovary")) return "/images/roman1.png"
  if (titreNormalized.includes("seigneur")) return "/images/Litte.png"
  if (titreNormalized.includes("harry potter")) return "/images/Litte.png"
  
  return "/placeholder.jpg"
}

interface Reservation {
  id: number
  livre_id: number
  titre: string
  auteur: string
  date_reservation: string
  statut: string
  position?: number
  total_reservations?: number
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [annulationEnCours, setAnnulationEnCours] = useState<number | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const data = await api.getReservations()
      setReservations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos réservations.",
        variant: "destructive",
      })
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const annulerReservation = async (reservationId: number) => {
    try {
      setAnnulationEnCours(reservationId)
      await api.annulerReservation(reservationId)
      toast({
        title: "Réservation annulée",
        description: "Votre réservation a été annulée avec succès.",
      })
      loadReservations()
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'annuler cette réservation.",
        variant: "destructive",
      })
    } finally {
      setAnnulationEnCours(null)
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en_attente':
        return <Badge className="bg-orange-100 text-orange-800">En attente</Badge>
      case 'validée':
        return <Badge className="bg-green-100 text-green-800">Validée</Badge>
      case 'annulée':
        return <Badge variant="destructive">Annulée</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement de vos réservations...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Réservations</h1>
        <p className="text-gray-600">Gérez vos réservations et suivez votre position dans la file d'attente</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter((r) => r.statut === 'en_attente').length}
                </p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter((r) => r.statut === 'validée').length}
                </p>
                <p className="text-sm text-gray-600">Prêtes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                <p className="text-sm text-gray-600">Total réservations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des réservations */}
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                  <img
                    src={getImageForBook(reservation.titre, reservation.auteur)}
                    alt={reservation.titre}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.jpg"
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{reservation.titre}</h3>
                      <p className="text-gray-600 mb-2">par {reservation.auteur}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatutBadge(reservation.statut)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Réservé le {formatDate(reservation.date_reservation)}</span>
                    </div>
                    {reservation.position && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Position {reservation.position} dans la file</span>
                      </div>
                    )}
                  </div>

                  {reservation.statut === 'en_attente' && (
                    <Button 
                      onClick={() => annulerReservation(reservation.id)}
                      disabled={annulationEnCours === reservation.id}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      {annulationEnCours === reservation.id ? "Annulation..." : "Annuler la réservation"}
                    </Button>
                  )}

                  {reservation.statut === 'validée' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Livre disponible !</h4>
                        <p className="text-sm text-green-700">
                          Votre livre est maintenant disponible. Vous pouvez l'emprunter.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reservations.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
          <p className="text-gray-600">Vous n'avez pas encore de réservations en cours.</p>
        </div>
      )}
    </div>
  )
}
