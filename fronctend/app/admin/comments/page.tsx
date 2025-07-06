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
  MessageSquare, 
  Search, 
  Calendar,
  User,
  Star,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  BookOpen
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
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Comment {
  id: string
  utilisateur_id: string
  livre_id: string
  utilisateur: {
    nom: string
    prenom: string
    email: string
  }
  livre: {
    titre: string
    auteur: string
    isbn: string
  }
  note: number
  commentaire: string
  date_creation: string
  statut: 'en_attente' | 'approuve' | 'rejete' | 'signale'
  motif_rejet?: string
  nombre_signalements: number
  date_moderation?: string
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getComments()
      setComments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error)
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.commentaire.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || comment.statut === statusFilter
    const matchesRating = ratingFilter === "all" || comment.note.toString() === ratingFilter
    
    return matchesSearch && matchesStatus && matchesRating
  })

  const handleApproveComment = async () => {
    if (!selectedComment) return
    
    try {
      await adminApi.approveComment(selectedComment.id)
      setIsApproveModalOpen(false)
      setSelectedComment(null)
      fetchComments()
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
      alert('Erreur lors de l\'approbation du commentaire')
    }
  }

  const handleRejectComment = async () => {
    if (!selectedComment) return
    
    try {
      await adminApi.rejectComment(selectedComment.id, { motif: rejectReason })
      setIsRejectModalOpen(false)
      setSelectedComment(null)
      setRejectReason("")
      fetchComments()
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
      alert('Erreur lors du rejet du commentaire')
    }
  }

  const handleDeleteComment = async () => {
    if (!selectedComment) return
    
    try {
      await adminApi.deleteComment(selectedComment.id)
      setIsDeleteModalOpen(false)
      setSelectedComment(null)
      fetchComments()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du commentaire')
    }
  }

  const openViewModal = (comment: Comment) => {
    setSelectedComment(comment)
    setIsViewModalOpen(true)
  }

  const openApproveModal = (comment: Comment) => {
    setSelectedComment(comment)
    setIsApproveModalOpen(true)
  }

  const openRejectModal = (comment: Comment) => {
    setSelectedComment(comment)
    setIsRejectModalOpen(true)
  }

  const openDeleteModal = (comment: Comment) => {
    setSelectedComment(comment)
    setIsDeleteModalOpen(true)
  }

  const getStatusBadge = (statut: string, nombreSignalements: number) => {
    if (nombreSignalements > 0 && statut !== 'rejete') {
      return <Badge className="bg-red-100 text-red-800">Signalé ({nombreSignalements})</Badge>
    }

    switch (statut) {
      case 'en_attente':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case 'approuve':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
      case 'rejete':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
      case 'signale':
        return <Badge className="bg-red-100 text-red-800">Signalé</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const getStarRating = (note: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < note ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({note}/5)</span>
      </div>
    )
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const pendingComments = comments.filter(c => c.statut === 'en_attente')
  const reportedComments = comments.filter(c => c.nombre_signalements > 0 && c.statut !== 'rejete')
  const approvedComments = comments.filter(c => c.statut === 'approuve')

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Commentaires
          </h1>
          <p className="text-gray-600 mt-1">
            Modérez les avis et commentaires des utilisateurs sur les livres
          </p>
        </div>
        <Button onClick={fetchComments} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total commentaires</p>
                <p className="text-2xl font-bold text-gray-900">{comments.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingComments.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signalés</p>
                <p className="text-2xl font-bold text-red-600">
                  {reportedComments.length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvedComments.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {reportedComments.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                {reportedComments.length} commentaire(s) signalé(s) nécessitent votre attention
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par utilisateur, livre ou commentaire..."
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
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="approuve">Approuvé</SelectItem>
                <SelectItem value="rejete">Rejeté</SelectItem>
                <SelectItem value="signale">Signalé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Note" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="5">5 étoiles</SelectItem>
                <SelectItem value="4">4 étoiles</SelectItem>
                <SelectItem value="3">3 étoiles</SelectItem>
                <SelectItem value="2">2 étoiles</SelectItem>
                <SelectItem value="1">1 étoile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des commentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires ({filteredComments.length})</CardTitle>
          <CardDescription>
            Liste complète des commentaires et avis des utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Livre</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {comment.utilisateur.prenom} {comment.utilisateur.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {comment.utilisateur.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{comment.livre.titre}</div>
                      <div className="text-sm text-gray-500">
                        {comment.livre.auteur}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStarRating(comment.note)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm">
                      {truncateText(comment.commentaire, 100)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(comment.date_creation).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(comment.statut, comment.nombre_signalements)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(comment)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {comment.statut === 'en_attente' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApproveModal(comment)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectModal(comment)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {comment.nombre_signalements > 0 && comment.statut !== 'rejete' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRejectModal(comment)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(comment)}
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

      {/* Modal de visualisation */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du commentaire</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Utilisateur</Label>
                  <p className="text-sm">
                    {selectedComment.utilisateur.prenom} {selectedComment.utilisateur.nom}
                  </p>
                  <p className="text-xs text-gray-500">{selectedComment.utilisateur.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Livre</Label>
                  <p className="text-sm">{selectedComment.livre.titre}</p>
                  <p className="text-xs text-gray-500">{selectedComment.livre.auteur}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Note</Label>
                  <div className="mt-1">
                    {getStarRating(selectedComment.note)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de création</Label>
                  <p className="text-sm">
                    {new Date(selectedComment.date_creation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Commentaire</Label>
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedComment.commentaire}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Statut</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedComment.statut, selectedComment.nombre_signalements)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Signalements</Label>
                  <p className="text-sm">
                    {selectedComment.nombre_signalements > 0 
                      ? `${selectedComment.nombre_signalements} signalement(s)`
                      : 'Aucun signalement'
                    }
                  </p>
                </div>
              </div>
              {selectedComment.motif_rejet && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Motif de rejet</Label>
                  <p className="text-sm mt-1 p-3 bg-red-50 rounded-lg text-red-800">
                    {selectedComment.motif_rejet}
                  </p>
                </div>
              )}
              {selectedComment.date_moderation && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de modération</Label>
                  <p className="text-sm">
                    {new Date(selectedComment.date_moderation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'approbation */}
      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver le commentaire</DialogTitle>
            <DialogDescription>
              Ce commentaire sera publié et visible par tous les utilisateurs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApproveComment} className="bg-green-600 hover:bg-green-700">
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de rejet */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le commentaire</DialogTitle>
            <DialogDescription>
              Ce commentaire sera rejeté et ne sera pas publié.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Motif du rejet *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Expliquez pourquoi ce commentaire est rejeté..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleRejectComment} 
              variant="destructive"
              disabled={!rejectReason.trim()}
            >
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le commentaire</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le commentaire sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleDeleteComment} variant="destructive">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
