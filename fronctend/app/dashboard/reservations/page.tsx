"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar } from "lucide-react"

interface Reservation {
  id: number
  livre_id: number
  date_reservation: string
  statut: string
  livre_titre: string
  livre_auteur: string
}

export default function ReservationsPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:4001/reservations/utilisateur/${user.id}`)
        .then((res) => res.json())
        .then((data) => setReservations(data))
        .finally(() => setLoading(false))
    }
  }, [user])

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Veuillez vous connecter pour voir vos réservations.</div>
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Chargement des réservations...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mes Réservations</h1>
      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation trouvée</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle>{r.livre_titre}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-gray-700">Auteur : {r.livre_auteur}</div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Réservé le : {new Date(r.date_reservation).toLocaleDateString()}
                </div>
                <div className="mt-2 text-xs text-blue-600">Statut : {r.statut}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
