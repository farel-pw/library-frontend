"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen, User, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface Livre {
  id: number
  titre: string
  auteur: string
  genre: string
  isbn: string
  annee_publication: number
  image_url: string
  description: string
  disponible: boolean
}

export default function LivresPage() {
  const [livres, setLivres] = useState<Livre[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    titre: "",
    auteur: "",
    genre: "all",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  const genres = ["Fiction", "Science", "Histoire", "Philosophie", "Informatique", "Mathématiques", "Littérature"]

  useEffect(() => {
    loadLivres()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadLivres = async () => {
    try {
      setLoading(true)
      const data = await api.getLivres(filters)
      setLivres(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erreur lors du chargement des livres:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les livres.",
        variant: "destructive",
      })
      setLivres([]) // Assurer que livres est toujours un tableau
    } finally {
      setLoading(false)
    }
  }

  const reserverLivre = async (livreId: number) => {
    if (!user) {
      toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive" })
      return
    }
    try {
      const res = await fetch("http://localhost:4001/reservations/reserver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utilisateur_id: user.id, livre_id: livreId }),
      })
      if (res.ok) {
        toast({ title: "Réservation réussie", description: "Le livre a été réservé." })
      } else {
        toast({ title: "Erreur", description: "Impossible de réserver ce livre.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Erreur lors de la réservation:", error)
      toast({ title: "Erreur", description: "Impossible de réserver ce livre.", variant: "destructive" })
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement des livres...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catalogue des Livres</h1>
        <p className="text-gray-600">Découvrez et empruntez les livres de notre collection</p>
      </div>

      {/* Filtres */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Recherche et Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Rechercher par titre</Label>
              <Input
                id="titre"
                placeholder="Titre du livre..."
                value={filters.titre}
                onChange={(e) => handleFilterChange("titre", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auteur">Rechercher par auteur</Label>
              <Input
                id="auteur"
                placeholder="Nom de l'auteur..."
                value={filters.auteur}
                onChange={(e) => handleFilterChange("auteur", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Filtrer par genre</Label>
              <Select value={filters.genre} onValueChange={(value) => handleFilterChange("genre", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les genres</SelectItem> {/* Updated value prop to 'all' */}
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des livres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {livres.map((livre) => (
          <Card key={livre.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-[3/4] bg-gray-200 relative">
              <img
                src={livre.image_url || "/placeholder.svg?height=300&width=200"}
                alt={livre.titre}
                className="w-full h-full object-cover"
              />
              {!livre.disponible && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="destructive">Non disponible</Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{livre.titre}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {livre.auteur}
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {livre.genre}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {livre.annee_publication}
                </div>
              </div>
              {livre.description && <p className="text-sm text-gray-600 mb-4 line-clamp-3">{livre.description}</p>}
              <Button 
                onClick={async () => {
                  try {
                    await api.emprunterLivre(livre.id)
                    toast({ 
                      title: "Succès", 
                      description: "Livre emprunté avec succès!" 
                    })
                    loadLivres() // Recharger la liste pour mettre à jour la disponibilité
                  } catch (error) {
                    console.error("Erreur lors de l'emprunt:", error)
                    toast({
                      title: "Erreur",
                      description: "Impossible d'emprunter ce livre.",
                      variant: "destructive",
                    })
                  }
                }} 
                disabled={!livre.disponible} 
                className="w-full"
              >
                {livre.disponible ? "Emprunter" : "Non disponible"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {livres.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun livre trouvé</h3>
          <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}
    </div>
  )
}
