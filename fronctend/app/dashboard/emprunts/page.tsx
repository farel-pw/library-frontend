"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
        description: "Impossible de retourner ce livre.",
        variant: "destructive",
      })
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
                    src={emprunt.image_url || "/placeholder.svg?height=80&width=64"}
                    alt={emprunt.titre}
                    className="w-full h-full object-cover rounded"
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
                    {emprunt.date_retour_effective && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Retourné le {formatDate(emprunt.date_retour_effective)}</span>
                      </div>
                    )}
                  </div>

                  {!emprunt.rendu && (
                    <Button onClick={() => retournerLivre(emprunt.id)} variant="outline">
                      Retourner le livre
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
