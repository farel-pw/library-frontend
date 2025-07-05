"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BookOpen, Users, Plus, Edit, Trash2, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface Etudiant {
  id: number
  nom: string
  prenom: string
  email: string
  studentId: string
  department: string
  useractive: boolean
  date_creation: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [livres, setLivres] = useState<Livre[]>([])
  const [etudiants, setEtudiants] = useState<Etudiant[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLivre, setEditingLivre] = useState<Livre | null>(null)

  const [livreForm, setLivreForm] = useState({
    titre: "",
    auteur: "",
    genre: "",
    isbn: "",
    annee_publication: new Date().getFullYear(),
    image_url: "",
    description: "",
    disponible: true,
  })

  const genres = ["Fiction", "Science", "Histoire", "Philosophie", "Informatique", "Mathématiques", "Littérature"]

  useEffect(() => {
    if (user?.role !== "admin") {
      router.push("/dashboard/livres")
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    try {
      const [livresData, etudiantsData] = await Promise.all([api.admin.getLivres(), api.admin.getEtudiants()])
      setLivres(livresData)
      setEtudiants(etudiantsData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLivreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingLivre) {
        await api.admin.modifierLivre(editingLivre.id, livreForm)
        toast({
          title: "Livre modifié",
          description: "Le livre a été modifié avec succès.",
        })
      } else {
        await api.admin.ajouterLivre(livreForm)
        toast({
          title: "Livre ajouté",
          description: "Le livre a été ajouté avec succès.",
        })
      }
      setDialogOpen(false)
      resetLivreForm()
      loadData()
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le livre.",
        variant: "destructive",
      })
    }
  }

  const supprimerLivre = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) return

    try {
      await api.admin.supprimerLivre(id)
      toast({
        title: "Livre supprimé",
        description: "Le livre a été supprimé avec succès.",
      })
      loadData()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le livre.",
        variant: "destructive",
      })
    }
  }

  const toggleEtudiantActif = async (id: number, actif: boolean) => {
    try {
      await api.admin.modifierEtudiant(id, { useractive: actif })
      toast({
        title: actif ? "Étudiant activé" : "Étudiant désactivé",
        description: "Le statut de l'étudiant a été modifié.",
      })
      loadData()
    } catch (error) {
      console.error("Erreur lors de la modification:", error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'étudiant.",
        variant: "destructive",
      })
    }
  }

  const supprimerEtudiant = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return

    try {
      await api.admin.supprimerEtudiant(id)
      toast({
        title: "Étudiant supprimé",
        description: "L'étudiant a été supprimé avec succès.",
      })
      loadData()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'étudiant.",
        variant: "destructive",
      })
    }
  }

  const resetLivreForm = () => {
    setLivreForm({
      titre: "",
      auteur: "",
      genre: "",
      isbn: "",
      annee_publication: new Date().getFullYear(),
      image_url: "",
      description: "",
      disponible: true,
    })
    setEditingLivre(null)
  }

  const editLivre = (livre: Livre) => {
    setLivreForm({
      titre: livre.titre,
      auteur: livre.auteur,
      genre: livre.genre,
      isbn: livre.isbn,
      annee_publication: livre.annee_publication,
      image_url: livre.image_url,
      description: livre.description,
      disponible: livre.disponible,
    })
    setEditingLivre(livre)
    setDialogOpen(true)
  }

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement du tableau de bord admin...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Administrateur</h1>
        <p className="text-gray-600">Gérez les livres et les étudiants de la bibliothèque</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{livres.length}</p>
                <p className="text-sm text-gray-600">Livres dans la collection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{etudiants.length}</p>
                <p className="text-sm text-gray-600">Étudiants inscrits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="livres" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="livres">Gestion des Livres</TabsTrigger>
          <TabsTrigger value="etudiants">Gestion des Étudiants</TabsTrigger>
        </TabsList>

        <TabsContent value="livres" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Livres</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetLivreForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un livre
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingLivre ? "Modifier le livre" : "Ajouter un nouveau livre"}</DialogTitle>
                  <DialogDescription>Remplissez les informations du livre ci-dessous.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLivreSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="titre">Titre</Label>
                        <Input
                          id="titre"
                          value={livreForm.titre}
                          onChange={(e) => setLivreForm({ ...livreForm, titre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="auteur">Auteur</Label>
                        <Input
                          id="auteur"
                          value={livreForm.auteur}
                          onChange={(e) => setLivreForm({ ...livreForm, auteur: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="genre">Genre</Label>
                        <Select
                          value={livreForm.genre}
                          onValueChange={(value) => setLivreForm({ ...livreForm, genre: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((genre) => (
                              <SelectItem key={genre} value={genre}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="annee">Année de publication</Label>
                        <Input
                          id="annee"
                          type="number"
                          value={livreForm.annee_publication}
                          onChange={(e) =>
                            setLivreForm({ ...livreForm, annee_publication: Number.parseInt(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={livreForm.isbn}
                        onChange={(e) => setLivreForm({ ...livreForm, isbn: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">URL de l'image</Label>
                      <Input
                        id="image_url"
                        value={livreForm.image_url}
                        onChange={(e) => setLivreForm({ ...livreForm, image_url: e.target.value })}
                        placeholder="https://exemple.com/image.jpg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={livreForm.description}
                        onChange={(e) => setLivreForm({ ...livreForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="disponible"
                        checked={livreForm.disponible}
                        onCheckedChange={(checked) => setLivreForm({ ...livreForm, disponible: checked })}
                      />
                      <Label htmlFor="disponible">Livre disponible</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">{editingLivre ? "Modifier" : "Ajouter"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {livres.map((livre) => (
                  <TableRow key={livre.id}>
                    <TableCell className="font-medium">{livre.titre}</TableCell>
                    <TableCell>{livre.auteur}</TableCell>
                    <TableCell>{livre.genre}</TableCell>
                    <TableCell>{livre.annee_publication}</TableCell>
                    <TableCell>
                      <Badge variant={livre.disponible ? "default" : "secondary"}>
                        {livre.disponible ? "Disponible" : "Indisponible"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => editLivre(livre)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => supprimerLivre(livre.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="etudiants" className="space-y-4">
          <h2 className="text-2xl font-semibold">Étudiants</h2>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>N° Étudiant</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {etudiants.map((etudiant) => (
                  <TableRow key={etudiant.id}>
                    <TableCell className="font-medium">
                      {etudiant.prenom} {etudiant.nom}
                    </TableCell>
                    <TableCell>{etudiant.email}</TableCell>
                    <TableCell>{etudiant.studentId}</TableCell>
                    <TableCell>{etudiant.department}</TableCell>
                    <TableCell>
                      <Badge variant={etudiant.useractive ? "default" : "secondary"}>
                        {etudiant.useractive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Switch
                          checked={etudiant.useractive}
                          onCheckedChange={(checked) => toggleEtudiantActif(etudiant.id, checked)}
                        />
                        <Button variant="outline" size="sm" onClick={() => supprimerEtudiant(etudiant.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
