"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Star,
  Calendar,
  User,
  Archive,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Book {
  id: string
  titre: string
  auteur: string
  isbn: string
  editeur: string
  annee_publication: number
  genre: string
  description: string
  exemplaires_total: number
  exemplaires_disponibles: number
  statut: 'disponible' | 'indisponible' | 'archive'
  date_ajout: string
  note_moyenne: number
  nombre_avis: number
  emprunts_total: number
  reservations_actives: number
}

interface BookFormData {
  titre: string
  auteur: string
  isbn: string
  editeur: string
  annee_publication: number
  genre: string
  description: string
  exemplaires_total: number
  statut: string
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [genreFilter, setGenreFilter] = useState("all")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [formData, setFormData] = useState<BookFormData>({
    titre: "",
    auteur: "",
    isbn: "",
    editeur: "",
    annee_publication: new Date().getFullYear(),
    genre: "",
    description: "",
    exemplaires_total: 1,
    statut: "disponible"
  })

  const genres = [
    "Fiction", "Non-fiction", "Science-fiction", "Fantasy", "Romance", 
    "Thriller", "Mystère", "Biographie", "Histoire", "Science", 
    "Philosophie", "Art", "Technique", "Autre"
  ]

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getBooks()
      setBooks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || book.statut === statusFilter
    const matchesGenre = genreFilter === "all" || book.genre === genreFilter
    
    return matchesSearch && matchesStatus && matchesGenre
  })

  const handleCreateBook = async () => {
    try {
      await adminApi.createBook(formData)
      setIsCreateModalOpen(false)
      setFormData({
        titre: "",
        auteur: "",
        isbn: "",
        editeur: "",
        annee_publication: new Date().getFullYear(),
        genre: "",
        description: "",
        exemplaires_total: 1,
        statut: "disponible"
      })
      fetchBooks()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création du livre')
    }
  }

  const handleUpdateBook = async () => {
    if (!selectedBook) return
    
    try {
      await adminApi.updateBook(selectedBook.id, formData)
      setIsEditModalOpen(false)
      setSelectedBook(null)
      fetchBooks()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour du livre')
    }
  }

  const handleDeleteBook = async () => {
    if (!selectedBook) return
    
    try {
      await adminApi.deleteBook(selectedBook.id)
      setIsDeleteModalOpen(false)
      setSelectedBook(null)
      fetchBooks()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du livre')
    }
  }

  const handleArchiveBook = async (bookId: string) => {
    try {
      await adminApi.archiveBook(bookId)
      fetchBooks()
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error)
      alert('Erreur lors de l\'archivage du livre')
    }
  }

  const handleUnarchiveBook = async (bookId: string) => {
    try {
      await adminApi.unarchiveBook(bookId)
      fetchBooks()
    } catch (error) {
      console.error('Erreur lors de la désarchivage:', error)
      alert('Erreur lors de la désarchivage du livre')
    }
  }

  const openEditModal = (book: Book) => {
    setSelectedBook(book)
    setFormData({
      titre: book.titre,
      auteur: book.auteur,
      isbn: book.isbn,
      editeur: book.editeur,
      annee_publication: book.annee_publication,
      genre: book.genre,
      description: book.description,
      exemplaires_total: book.exemplaires_total,
      statut: book.statut
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (book: Book) => {
    setSelectedBook(book)
    setIsViewModalOpen(true)
  }

  const openDeleteModal = (book: Book) => {
    setSelectedBook(book)
    setIsDeleteModalOpen(true)
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'disponible':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>
      case 'indisponible':
        return <Badge className="bg-red-100 text-red-800">Indisponible</Badge>
      case 'archive':
        return <Badge className="bg-gray-100 text-gray-800">Archivé</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const getAvailabilityBadge = (book: Book) => {
    const ratio = book.exemplaires_total > 0 ? book.exemplaires_disponibles / book.exemplaires_total : 0
    if (ratio === 0) {
      return <Badge variant="destructive">Épuisé</Badge>
    } else if (ratio < 0.3) {
      return <Badge className="bg-orange-100 text-orange-800">Faible stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">En stock</Badge>
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
            <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Livres
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez le catalogue de livres, les exemplaires et leur disponibilité
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau livre
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total livres</p>
                <p className="text-2xl font-bold text-gray-900">{books.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">
                  {books.filter(b => b.statut === 'disponible').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Épuisés</p>
                <p className="text-2xl font-bold text-red-600">
                  {books.filter(b => b.exemplaires_disponibles === 0).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archivés</p>
                <p className="text-2xl font-bold text-gray-600">
                  {books.filter(b => b.statut === 'archive').length}
                </p>
              </div>
              <Archive className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre, auteur ou ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="indisponible">Indisponible</SelectItem>
                <SelectItem value="archive">Archivé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des livres */}
      <Card>
        <CardHeader>
          <CardTitle>Livres ({filteredBooks.length})</CardTitle>
          <CardDescription>
            Catalogue complet des livres avec leurs informations et statistiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livre</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Exemplaires</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Activité</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{book.titre}</div>
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {book.auteur}
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {book.annee_publication}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{book.genre}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {book.exemplaires_disponibles}/{book.exemplaires_total}
                      </div>
                      {getAvailabilityBadge(book)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(book.statut)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">
                        {book.note_moyenne?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({book.nombre_avis} avis)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">
                        {book.emprunts_total} emprunts
                      </div>
                      <div className="text-xs text-gray-600">
                        {book.reservations_actives} réservations
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(book)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(book)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      {book.statut === 'archive' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnarchiveBook(book.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchiveBook(book.id)}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <Archive className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(book)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de création */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau livre</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau livre au catalogue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titre">Titre *</Label>
                <Input
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="auteur">Auteur *</Label>
                <Input
                  id="auteur"
                  value={formData.auteur}
                  onChange={(e) => setFormData({ ...formData, auteur: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editeur">Éditeur</Label>
                <Input
                  id="editeur"
                  value={formData.editeur}
                  onChange={(e) => setFormData({ ...formData, editeur: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="annee">Année</Label>
                <Input
                  id="annee"
                  type="number"
                  value={formData.annee_publication}
                  onChange={(e) => setFormData({ ...formData, annee_publication: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="exemplaires">Exemplaires</Label>
                <Input
                  id="exemplaires"
                  type="number"
                  min="1"
                  value={formData.exemplaires_total}
                  onChange={(e) => setFormData({ ...formData, exemplaires_total: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateBook}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de modification */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le livre</DialogTitle>
            <DialogDescription>
              Modifiez les informations du livre
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-titre">Titre *</Label>
                <Input
                  id="edit-titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-auteur">Auteur *</Label>
                <Input
                  id="edit-auteur"
                  value={formData.auteur}
                  onChange={(e) => setFormData({ ...formData, auteur: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-isbn">ISBN</Label>
                <Input
                  id="edit-isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-editeur">Éditeur</Label>
                <Input
                  id="edit-editeur"
                  value={formData.editeur}
                  onChange={(e) => setFormData({ ...formData, editeur: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-annee">Année</Label>
                <Input
                  id="edit-annee"
                  type="number"
                  value={formData.annee_publication}
                  onChange={(e) => setFormData({ ...formData, annee_publication: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-genre">Genre</Label>
                <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-exemplaires">Exemplaires</Label>
                <Input
                  id="edit-exemplaires"
                  type="number"
                  min="1"
                  value={formData.exemplaires_total}
                  onChange={(e) => setFormData({ ...formData, exemplaires_total: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-statut">Statut</Label>
              <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="indisponible">Indisponible</SelectItem>
                  <SelectItem value="archive">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateBook}>Modifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de visualisation */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du livre</DialogTitle>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Titre</Label>
                  <p className="text-sm">{selectedBook.titre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Auteur</Label>
                  <p className="text-sm">{selectedBook.auteur}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">ISBN</Label>
                  <p className="text-sm">{selectedBook.isbn}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Éditeur</Label>
                  <p className="text-sm">{selectedBook.editeur}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Année</Label>
                  <p className="text-sm">{selectedBook.annee_publication}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Genre</Label>
                  <p className="text-sm">{selectedBook.genre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Statut</Label>
                  {getStatusBadge(selectedBook.statut)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Exemplaires</Label>
                  <p className="text-sm">
                    {selectedBook.exemplaires_disponibles} / {selectedBook.exemplaires_total}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Note moyenne</Label>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">
                      {selectedBook.note_moyenne?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({selectedBook.nombre_avis} avis)
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-sm mt-1">{selectedBook.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date d'ajout</Label>
                  <p className="text-sm">
                    {new Date(selectedBook.date_ajout).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Statistiques</Label>
                  <div className="text-sm space-y-1">
                    <div>{selectedBook.emprunts_total} emprunts total</div>
                    <div>{selectedBook.reservations_actives} réservations actives</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le livre "{selectedBook?.titre}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteBook}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
