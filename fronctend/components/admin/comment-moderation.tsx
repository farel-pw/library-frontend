"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Search, 
  Filter,
  Star,
  Calendar,
  User,
  Book,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Comment {
  id: string
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

interface CommentModerationProps {
  comments: Comment[]
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
  onDelete: (id: string) => void
  onView: (comment: Comment) => void
}

export const CommentModeration: React.FC<CommentModerationProps> = ({
  comments,
  onApprove,
  onReject,
  onDelete,
  onView
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date_desc")

  const getStatusBadge = (status: string, signalements: number) => {
    switch (status) {
      case 'en_attente':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">En attente</Badge>
      case 'approuve':
        return <Badge variant="outline" className="text-green-600 border-green-600">Approuvé</Badge>
      case 'rejete':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejeté</Badge>
      case 'signale':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">Signalé ({signalements})</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    )
  }

  const filteredComments = comments
    .filter(comment => {
      const matchesSearch = 
        comment.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.commentaire.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || comment.statut === statusFilter
      const matchesRating = ratingFilter === "all" || comment.note.toString() === ratingFilter
      
      return matchesSearch && matchesStatus && matchesRating
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
        case 'date_asc':
          return new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime()
        case 'rating_desc':
          return b.note - a.note
        case 'rating_asc':
          return a.note - b.note
        case 'signalements_desc':
          return b.nombre_signalements - a.nombre_signalements
        default:
          return 0
      }
    })

  const stats = {
    total: comments.length,
    en_attente: comments.filter(c => c.statut === 'en_attente').length,
    approuve: comments.filter(c => c.statut === 'approuve').length,
    rejete: comments.filter(c => c.statut === 'rejete').length,
    signale: comments.filter(c => c.nombre_signalements > 0).length,
    note_moyenne: comments.length > 0 ? comments.reduce((sum, c) => sum + c.note, 0) / comments.length : 0
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.en_attente}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approuve}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejete}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Signalés</p>
                <p className="text-2xl font-bold text-orange-600">{stats.signale}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Note moy.</p>
                <p className="text-2xl font-bold">{stats.note_moyenne.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par utilisateur, livre ou commentaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Statut" />
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Note" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les notes</SelectItem>
                <SelectItem value="5">5 étoiles</SelectItem>
                <SelectItem value="4">4 étoiles</SelectItem>
                <SelectItem value="3">3 étoiles</SelectItem>
                <SelectItem value="2">2 étoiles</SelectItem>
                <SelectItem value="1">1 étoile</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Date (récent)</SelectItem>
                <SelectItem value="date_asc">Date (ancien)</SelectItem>
                <SelectItem value="rating_desc">Note (haute)</SelectItem>
                <SelectItem value="rating_asc">Note (basse)</SelectItem>
                <SelectItem value="signalements_desc">Signalements</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des commentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Commentaires ({filteredComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Livre</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{comment.utilisateur.prenom} {comment.utilisateur.nom}</p>
                      <p className="text-sm text-gray-500">{comment.utilisateur.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{comment.livre.titre}</p>
                      <p className="text-sm text-gray-500">{comment.livre.auteur}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRatingStars(comment.note)}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate" title={comment.commentaire}>
                      {comment.commentaire}
                    </p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(comment.statut, comment.nombre_signalements)}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {new Date(comment.date_creation).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(comment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {comment.statut === 'en_attente' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onApprove(comment.id)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReject(comment.id, "Contenu inapproprié")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
