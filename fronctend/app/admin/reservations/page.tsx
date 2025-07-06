"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Search, 
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  AlertCircle,
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

interface Reservation {
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
  date_reservation: string
  date_expiration: string
  statut: 'en_attente' | 'prete' | 'expiree' | 'annulee' | 'transformee'
  position_file: number
  notes_admin?: string
  date_notification?: string
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [actionNotes, setActionNotes] = useState("")

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getReservations()
      setReservations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error)
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.livre.auteur.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || reservation.statut === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleApproveReservation = async () => {
    if (!selectedReservation) return
    
    try {
      await adminApi.approveReservation(selectedReservation.id, { notes_admin: actionNotes })
      setIsApproveModalOpen(false)
      setSelectedReservation(null)
      setActionNotes("")
      fetchReservations()
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
      alert('Erreur lors de l\'approbation de la réservation')
    }
  }

  const handleCancelReservation = async () => {
    if (!selectedReservation) return
    
    try {
      await adminApi.cancelReservation(selectedReservation.id, { notes_admin: actionNotes })
      setIsCancelModalOpen(false)
      setSelectedReservation(null)
      setActionNotes("")
      fetchReservations()
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      alert('Erreur lors de l\'annulation de la réservation')
    }
  }

  const handleNotifyUser = async (reservationId: string) => {
    try {
      await adminApi.notifyReservation(reservationId)
      fetchReservations()
    } catch (error) {
      console.error('Erreur lors de la notification:', error)
      alert('Erreur lors de la notification')
    }
  }

  const openViewModal = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsViewModalOpen(true)
  }

  const openApproveModal = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsApproveModalOpen(true)
  }

  const openCancelModal = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsCancelModalOpen(true)
  }

  const getStatusBadge = (statut: string, dateExpiration: string) => {
    const today = new Date()
    const expirationDate = new Date(dateExpiration)
    const isExpired = today > expirationDate && statut === 'prete'

    switch (statut) {
      case 'en_attente':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case 'prete':
        if (isExpired) {
          return <Badge className="bg-red-100 text-red-800">Expirée</Badge>
        }
        return <Badge className="bg-green-100 text-green-800">Prête</Badge>
      case 'expiree':
        return <Badge className="bg-red-100 text-red-800">Expirée</Badge>
      case 'annulee':
        return <Badge className="bg-gray-100 text-gray-800">Annulée</Badge>
      case 'transformee':
        return <Badge className="bg-blue-100 text-blue-800">Transformée</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const getPriorityBadge = (position: number) => {
    if (position === 1) {
      return <Badge className="bg-red-100 text-red-800">Priorité 1</Badge>
    } else if (position <= 3) {
      return <Badge className="bg-orange-100 text-orange-800">Priorité {position}</Badge>
    } else {
      return <Badge variant="outline">Position {position}</Badge>
    }
  }

  const getDaysUntilExpiration = (dateExpiration: string) => {
    const today = new Date()
    const expirationDate = new Date(dateExpiration)
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `Expiré il y a ${Math.abs(diffDays)} jour(s)`
    } else if (diffDays === 0) {
      return "Expire aujourd'hui"
    } else if (diffDays <= 2) {
      return `Expire dans ${diffDays} jour(s)`
    } else {
      return `${diffDays} jours`
    }
  }

  const getUrgencyColor = (dateExpiration: string, statut: string) => {
    if (statut !== 'prete') return 'text-gray-600'
    
    const today = new Date()
    const expirationDate = new Date(dateExpiration)
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-red-600'
    if (diffDays <= 2) return 'text-orange-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const readyReservations = reservations.filter(r => r.statut === 'prete')
  const waitingReservations = reservations.filter(r => r.statut === 'en_attente')
  const expiredReservations = reservations.filter(r => {
    const today = new Date()
    const expirationDate = new Date(r.date_expiration)
    return r.statut === 'prete' && today > expirationDate
  })

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Réservations
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les réservations de livres et la file d'attente
          </p>
        </div>
        <Button onClick={fetchReservations} variant="outline">
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
                <p className="text-sm font-medium text-gray-600">Total réservations</p>
                <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {waitingReservations.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prêtes</p>
                <p className="text-2xl font-bold text-green-600">
                  {readyReservations.length}
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
                <p className="text-sm font-medium text-gray-600">Expirées</p>
                <p className="text-2xl font-bold text-red-600">
                  {expiredReservations.length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {expiredReservations.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                {expiredReservations.length} réservation(s) expirée(s) nécessitent votre attention
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
                  placeholder="Rechercher par utilisateur ou livre..."
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
                <SelectItem value="prete">Prête</SelectItem>
                <SelectItem value="expiree">Expirée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
                <SelectItem value="transformee">Transformée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des réservations */}
      <Card>
        <CardHeader>
          <CardTitle>Réservations ({filteredReservations.length})</CardTitle>
          <CardDescription>
            Liste complète des réservations avec leur statut et position dans la file d'attente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Livre</TableHead>
                <TableHead>Date réservation</TableHead>
                <TableHead>Position/Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {reservation.utilisateur.prenom} {reservation.utilisateur.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.utilisateur.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.livre.titre}</div>
                      <div className="text-sm text-gray-500">
                        {reservation.livre.auteur}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(reservation.position_file)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(reservation.statut, reservation.date_expiration)}
                  </TableCell>
                  <TableCell>
                    {reservation.statut === 'prete' ? (
                      <div>
                        <div className="text-sm">
                          {new Date(reservation.date_expiration).toLocaleDateString('fr-FR')}
                        </div>
                        <div className={`text-xs ${getUrgencyColor(reservation.date_expiration, reservation.statut)}`}>
                          {getDaysUntilExpiration(reservation.date_expiration)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(reservation)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {reservation.statut === 'en_attente' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openApproveModal(reservation)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      {reservation.statut === 'prete' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNotifyUser(reservation.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <BookOpen className="h-3 w-3" />
                        </Button>
                      )}
                      {['en_attente', 'prete'].includes(reservation.statut) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCancelModal(reservation)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      )}
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
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Utilisateur</Label>
                  <p className="text-sm">
                    {selectedReservation.utilisateur.prenom} {selectedReservation.utilisateur.nom}
                  </p>
                  <p className="text-xs text-gray-500">{selectedReservation.utilisateur.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Livre</Label>
                  <p className="text-sm">{selectedReservation.livre.titre}</p>
                  <p className="text-xs text-gray-500">{selectedReservation.livre.auteur}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de réservation</Label>
                  <p className="text-sm">
                    {new Date(selectedReservation.date_reservation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Position dans la file</Label>
                  <p className="text-sm">{selectedReservation.position_file}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Statut</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedReservation.statut, selectedReservation.date_expiration)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date d'expiration</Label>
                  <p className="text-sm">
                    {new Date(selectedReservation.date_expiration).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              {selectedReservation.date_notification && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de notification</Label>
                  <p className="text-sm">
                    {new Date(selectedReservation.date_notification).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              {selectedReservation.notes_admin && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes administratives</Label>
                  <p className="text-sm mt-1">{selectedReservation.notes_admin}</p>
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
            <DialogTitle>Approuver la réservation</DialogTitle>
            <DialogDescription>
              Marquer cette réservation comme prête pour {selectedReservation?.utilisateur.prenom} {selectedReservation?.utilisateur.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-notes">Notes (optionnel)</Label>
              <Input
                id="approve-notes"
                placeholder="Instructions pour l'utilisateur..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApproveReservation} className="bg-green-600 hover:bg-green-700">
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'annulation */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la réservation</DialogTitle>
            <DialogDescription>
              Annuler la réservation de {selectedReservation?.utilisateur.prenom} {selectedReservation?.utilisateur.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-notes">Raison de l'annulation</Label>
              <Input
                id="cancel-notes"
                placeholder="Motif de l'annulation..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCancelReservation} variant="destructive">
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
