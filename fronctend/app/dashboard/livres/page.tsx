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

// Fonction pour associer les livres aux images disponibles
const getImageForBook = (titre: string, auteur: string, genre: string): string => {
  const titreNormalized = titre.toLowerCase()
  const auteurNormalized = auteur.toLowerCase()
  const genreNormalized = genre.toLowerCase()
  
  // Correspondances spécifiques par titre
  if (titreNormalized.includes("histoire") || titreNormalized.includes("temps")) return "/images/histoire du temps.png"
  if (titreNormalized.includes("comte") || titreNormalized.includes("monte-cristo")) return "/images/le comte de monte-cristo.png"
  if (titreNormalized.includes("kant") || titreNormalized.includes("critique")) return "/images/la critique de Kant.png"
  if (titreNormalized.includes("newton") || titreNormalized.includes("principe")) return "/images/principe newton.png"
  if (auteurNormalized.includes("victor hugo")) return "/images/victor hugo.png"
  if (auteurNormalized.includes("yuval noah")) return "/images/yuval noah.png"
  
  // Correspondances par genre
  if (genreNormalized.includes("intelligence") || genreNormalized.includes("ia")) return "/images/ia.png"
  if (genreNormalized.includes("informatique")) return "/images/informatique.png"
  if (genreNormalized.includes("mathématiques") || genreNormalized.includes("maths")) return "/images/maths.png"
  if (genreNormalized.includes("science")) return "/images/science.png"
  if (genreNormalized.includes("histoire") || genreNormalized.includes("history")) return "/images/hist.png"
  if (genreNormalized.includes("littérature") || genreNormalized.includes("roman")) return "/images/roman.png"
  
  // Images par défaut selon le genre
  switch (genreNormalized) {
    case "fiction":
    case "romance":
    case "classique":
      return "/images/roman1.png"
    case "science-fiction":
    case "science":
      return "/images/science1.png"
    case "philosophie":
      return "/images/la critique de Kant.png"
    case "informatique":
      return "/images/Inf2.png"
    case "fantasy":
    case "littérature":
      return "/images/Litte.png"
    default:
      return "/placeholder.jpg"
  }
}

export default function LivresPage() {
  const [livres, setLivres] = useState<Livre[]>([])
  const [livresFiltered, setLivresFiltered] = useState<Livre[]>([])
  const [loading, setLoading] = useState(true)
  const [empruntEnCours, setEmpruntEnCours] = useState<number | null>(null)
  const [reservationEnCours, setReservationEnCours] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    titre: "",
    auteur: "",
    genre: "all",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  const genres = ["Fiction", "Science-Fiction", "Histoire", "Philosophie", "Informatique", "Mathématiques", "Littérature", "Romance", "Classique", "Fantasy"]

  useEffect(() => {
    loadLivres()
  }, [])

  useEffect(() => {
    filterLivres()
  }, [filters, livres])

  const loadLivres = async () => {
    try {
      setLoading(true)
      const data = await api.getLivres()
      const livresArray = Array.isArray(data) ? data : []
      setLivres(livresArray)
      setLivresFiltered(livresArray)
    } catch (error) {
      console.error("Erreur lors du chargement des livres:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les livres.",
        variant: "destructive",
      })
      setLivres([])
      setLivresFiltered([])
    } finally {
      setLoading(false)
    }
  }

  const filterLivres = () => {
    let filtered = [...livres]

    // Filtrer par titre
    if (filters.titre.trim()) {
      filtered = filtered.filter(livre =>
        livre.titre.toLowerCase().includes(filters.titre.toLowerCase())
      )
    }

    // Filtrer par auteur
    if (filters.auteur.trim()) {
      filtered = filtered.filter(livre =>
        livre.auteur.toLowerCase().includes(filters.auteur.toLowerCase())
      )
    }

    // Filtrer par genre
    if (filters.genre && filters.genre !== "all") {
      filtered = filtered.filter(livre =>
        livre.genre.toLowerCase() === filters.genre.toLowerCase()
      )
    }

    setLivresFiltered(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const reserverLivre = async (livreId: number) => {
    if (!user) {
      toast({ 
        title: "Erreur", 
        description: "Vous devez être connecté pour réserver un livre.", 
        variant: "destructive" 
      })
      return
    }
    
    try {
      setReservationEnCours(livreId)
      await api.reserverLivre(livreId)
      toast({ 
        title: "Succès", 
        description: "Livre réservé avec succès! Vous serez notifié quand il sera disponible." 
      })
    } catch (error) {
      console.error("Erreur lors de la réservation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de réserver ce livre. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setReservationEnCours(null)
    }
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
                  <SelectItem value="all">Tous les genres</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Bouton pour effacer les filtres et résumé des résultats */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              {livresFiltered.length} livre{livresFiltered.length > 1 ? 's' : ''} trouvé{livresFiltered.length > 1 ? 's' : ''} 
              {livres.length > 0 && ` sur ${livres.length} total`}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ titre: "", auteur: "", genre: "all" })}
              disabled={filters.titre === "" && filters.auteur === "" && filters.genre === "all"}
            >
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des livres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {livresFiltered.map((livre) => (
          <Card key={livre.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-[3/4] bg-gray-200 relative">
              <img
                src={getImageForBook(livre.titre, livre.auteur, livre.genre)}
                alt={livre.titre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback si l'image ne se charge pas
                  (e.target as HTMLImageElement).src = "/placeholder.jpg"
                }}
              />
            </div>
            <CardContent className="p-4">
              {/* Badge de disponibilité */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg line-clamp-2 flex-1">{livre.titre}</h3>
                <Badge 
                  variant={livre.disponible ? "default" : "secondary"}
                  className={livre.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {livre.disponible ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
              
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
              
              {/* Boutons conditionnels */}
              {livre.disponible ? (
                <Button 
                  onClick={async () => {
                    if (!user) {
                      toast({ 
                        title: "Erreur", 
                        description: "Vous devez être connecté pour emprunter un livre.", 
                        variant: "destructive" 
                      })
                      return
                    }
                    
                    try {
                      setEmpruntEnCours(livre.id)
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
                        description: "Impossible d'emprunter ce livre. Veuillez réessayer.",
                        variant: "destructive",
                      })
                    } finally {
                      setEmpruntEnCours(null)
                    }
                  }} 
                  disabled={empruntEnCours === livre.id} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {empruntEnCours === livre.id ? "Emprunt en cours..." : "Emprunter"}
                </Button>
              ) : (
                <Button 
                  onClick={() => reserverLivre(livre.id)}
                  disabled={reservationEnCours === livre.id}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {reservationEnCours === livre.id ? "Réservation en cours..." : "Réserver"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {livresFiltered.length === 0 && !loading && (
        <div className="text-center py-12 col-span-full">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {livres.length === 0 ? "Aucun livre disponible" : "Aucun livre trouvé"}
          </h3>
          <p className="text-gray-600">
            {livres.length === 0 ? 
              "La bibliothèque est vide pour le moment." :
              "Essayez de modifier vos critères de recherche."
            }
          </p>
        </div>
      )}
    </div>
  )
}
