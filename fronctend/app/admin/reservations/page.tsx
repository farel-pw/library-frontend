"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
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
  BookOpen,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  ArrowUpDown,
  MoreHorizontal,
  History,
  Users,
  TrendingUp
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
    telephone?: string
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
  date_creation?: string
  date_modification?: string
}

type SortField = 'date_reservation' | 'position_file' | 'statut' | 'utilisateur' | 'livre'
type SortOrder = 'asc' | 'desc'

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>('date_reservation')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedReservations, setSelectedReservations] = useState<string[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false)
  const [actionNotes, setActionNotes] = useState("")
  const [bulkAction, setBulkAction] = useState<'approve' | 'cancel' | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminApi.getReservations()
      setReservations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive"
      })
      setReservations([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Filtrage et tri optimisés avec useMemo
  const filteredAndSortedReservations = useMemo(() => {
    let filtered = reservations.filter(reservation => {
      const matchesSearch = 
        reservation.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.livre.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || reservation.statut === statusFilter
      
      const matchesPriority = priorityFilter === "all" || 
        (priorityFilter === "high" && reservation.position_file <= 3) ||
        (priorityFilter === "normal" && reservation.position_file > 3)
      
      const matchesTab = activeTab === "all" || 
        (activeTab === "urgent" && isUrgent(reservation)) ||
        (activeTab === "waiting" && reservation.statut === "en_attente") ||
        (activeTab === "ready" && reservation.statut === "prete") ||
        (activeTab === "expired" && isExpired(reservation))
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTab
    })

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case 'date_reservation':
          aValue = new Date(a.date_reservation).getTime()
          bValue = new Date(b.date_reservation).getTime()
          break
        case 'position_file':
          aValue = a.position_file
          bValue = b.position_file
          break
        case 'statut':
          aValue = a.statut
          bValue = b.statut
          break
        case 'utilisateur':
          aValue = `${a.utilisateur.nom} ${a.utilisateur.prenom}`
          bValue = `${b.utilisateur.nom} ${b.utilisateur.prenom}`
          break
        case 'livre':
          aValue = a.livre.titre
          bValue = b.livre.titre
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [reservations, searchTerm, statusFilter, priorityFilter, activeTab, sortField, sortOrder])

  // Fonctions utilitaires
  const isUrgent = useCallback((reservation: Reservation) => {
    if (reservation.statut !== 'prete') return false
    const today = new Date()
    const expirationDate = new Date(reservation.date_expiration)
    const diffDays = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 2
  }, [])

  const isExpired = useCallback((reservation: Reservation) => {
    const today = new Date()
    const expirationDate = new Date(reservation.date_expiration)
    return reservation.statut === 'prete' && today > expirationDate
  }, [])

  // Fonctions utilitaires pour l'affichage
  const getStatusBadge = useCallback((statut: string, dateExpiration: string) => {
    const today = new Date()
    const expirationDate = new Date(dateExpiration)
    const isExpired = today > expirationDate && statut === 'prete'

    switch (statut) {
      case 'en_attente':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">En attente</Badge>
      case 'prete':
        if (isExpired) {
          return <Badge className="bg-red-100 text-red-800 border-red-300">Expirée</Badge>
        }
        return <Badge className="bg-green-100 text-green-800 border-green-300">Prête</Badge>
      case 'expiree':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Expirée</Badge>
      case 'annulee':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Annulée</Badge>
      case 'transformee':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Transformée</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }, [])

  const getPriorityBadge = useCallback((position: number) => {
    if (position === 1) {
      return <Badge className="bg-red-100 text-red-800 border-red-300 font-semibold">Priorité 1</Badge>
    } else if (position <= 3) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Priorité {position}</Badge>
    } else {
      return <Badge variant="outline" className="text-gray-600">Position {position}</Badge>
    }
  }, [])

  const getDaysUntilExpiration = useCallback((dateExpiration: string) => {
    const today = new Date()
    const expirationDate = new Date(dateExpiration)
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `Expiré il y a ${Math.abs(diffDays)} jour(s)`
    } else if (diffDays === 0) {
      return "Expire aujourd'hui"
    } else if (diffDays === 1) {
      return "Expire demain"
    } else if (diffDays <= 2) {
      return `Expire dans ${diffDays} jours`
    } else {
      return `${diffDays} jours restants`
    }
  }, [])

  const getUrgencyColor = useCallback((dateExpiration: string, statut: string) => {
    if (statut !== 'prete') return 'text-gray-600'
    
    const today = new Date()
    const expirationDate = new Date(dateExpiration)
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-red-600 font-semibold'
    if (diffDays === 0) return 'text-red-500 font-medium'
    if (diffDays <= 2) return 'text-orange-600'
    return 'text-gray-600'
  }, [])

  // Actions avec gestion d'erreur améliorée
  const handleApproveReservation = useCallback(async () => {
    if (!selectedReservation) return
    
    try {
      await adminApi.approveReservation(selectedReservation.id, { notes_admin: actionNotes })
      toast({
        title: "Succès",
        description: "Réservation approuvée avec succès"
      })
      setIsApproveModalOpen(false)
      setSelectedReservation(null)
      setActionNotes("")
      fetchReservations()
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'approbation de la réservation",
        variant: "destructive"
      })
    }
  }, [selectedReservation, actionNotes, fetchReservations])

  const handleCancelReservation = useCallback(async () => {
    if (!selectedReservation) return
    
    try {
      await adminApi.cancelReservation(selectedReservation.id, { notes_admin: actionNotes })
      toast({
        title: "Succès",
        description: "Réservation annulée avec succès"
      })
      setIsCancelModalOpen(false)
      setSelectedReservation(null)
      setActionNotes("")
      fetchReservations()
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'annulation de la réservation",
        variant: "destructive"
      })
    }
  }, [selectedReservation, actionNotes, fetchReservations])

  const handleNotifyUser = useCallback(async (reservationId: string) => {
    try {
      await adminApi.notifyReservation(reservationId)
      toast({
        title: "Succès",
        description: "Notification envoyée à l'utilisateur"
      })
      fetchReservations()
    } catch (error) {
      console.error('Erreur lors de la notification:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de la notification",
        variant: "destructive"
      })
    }
  }, [fetchReservations])

  // Actions en lot
  const handleBulkAction = useCallback(async () => {
    if (selectedReservations.length === 0 || !bulkAction) return

    try {
      for (const reservationId of selectedReservations) {
        if (bulkAction === 'approve') {
          await adminApi.approveReservation(reservationId, { notes_admin: actionNotes })
        } else if (bulkAction === 'cancel') {
          await adminApi.cancelReservation(reservationId, { notes_admin: actionNotes })
        }
      }
      
      toast({
        title: "Succès",
        description: `${selectedReservations.length} réservation(s) ${bulkAction === 'approve' ? 'approuvée(s)' : 'annulée(s)'} avec succès`
      })
      
      setIsBulkActionModalOpen(false)
      setSelectedReservations([])
      setBulkAction(null)
      setActionNotes("")
      fetchReservations()
    } catch (error) {
      console.error('Erreur lors de l\'action en lot:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'action en lot",
        variant: "destructive"
      })
    }
  }, [selectedReservations, bulkAction, actionNotes, fetchReservations])

  // Gestionnaires d'événements
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }, [sortField, sortOrder])

  const handleSelectReservation = useCallback((reservationId: string) => {
    setSelectedReservations(prev => 
      prev.includes(reservationId) 
        ? prev.filter(id => id !== reservationId)
        : [...prev, reservationId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedReservations.length === filteredAndSortedReservations.length) {
      setSelectedReservations([])
    } else {
      setSelectedReservations(filteredAndSortedReservations.map(r => r.id))
    }
  }, [selectedReservations.length, filteredAndSortedReservations])

  const exportToCSV = useCallback(() => {
    const headers = ['ID', 'Utilisateur', 'Email', 'Livre', 'Auteur', 'Date Réservation', 'Statut', 'Position', 'Date Expiration']
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedReservations.map(r => [
        r.id,
        `"${r.utilisateur.prenom} ${r.utilisateur.nom}"`,
        r.utilisateur.email,
        `"${r.livre.titre}"`,
        `"${r.livre.auteur}"`,
        new Date(r.date_reservation).toLocaleDateString('fr-FR'),
        r.statut,
        r.position_file,
        new Date(r.date_expiration).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [filteredAndSortedReservations])

  // Modales
  const openViewModal = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsViewModalOpen(true)
  }, [])

  const openApproveModal = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsApproveModalOpen(true)
  }, [])

  const openCancelModal = useCallback((reservation: Reservation) => {
    setSelectedReservation(reservation)
    setIsCancelModalOpen(true)
  }, [])

  const openBulkActionModal = useCallback((action: 'approve' | 'cancel') => {
    setBulkAction(action)
    setIsBulkActionModalOpen(true)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Réservations
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les réservations de livres et la file d'attente ({reservations.length} réservations)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={fetchReservations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques rapides améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("all")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("waiting")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reservations.filter(r => r.statut === 'en_attente').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("ready")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Prêtes</p>
                <p className="text-2xl font-bold text-green-600">
                  {reservations.filter(r => r.statut === 'prete').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("urgent")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reservations.filter(r => isUrgent(r)).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("expired")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expirées</p>
                <p className="text-2xl font-bold text-red-600">
                  {reservations.filter(r => isExpired(r)).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes urgentes */}
      {reservations.filter(r => isExpired(r)).length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <strong>{reservations.filter(r => isExpired(r)).length} réservation(s) expirée(s)</strong> nécessitent votre attention immédiate.
          </AlertDescription>
        </Alert>
      )}

      {reservations.filter(r => isUrgent(r)).length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <TrendingUp className="h-4 w-4" />
          <AlertDescription className="text-orange-800">
            <strong>{reservations.filter(r => isUrgent(r)).length} réservation(s) urgente(s)</strong> expirent dans moins de 2 jours.
          </AlertDescription>
        </Alert>
      )}

      {/* Onglets de filtrage */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Toutes ({reservations.length})</TabsTrigger>
          <TabsTrigger value="waiting">En attente ({reservations.filter(r => r.statut === 'en_attente').length})</TabsTrigger>
          <TabsTrigger value="ready">Prêtes ({reservations.filter(r => r.statut === 'prete').length})</TabsTrigger>
          <TabsTrigger value="urgent">Urgentes ({reservations.filter(r => isUrgent(r)).length})</TabsTrigger>
          <TabsTrigger value="expired">Expirées ({reservations.filter(r => isExpired(r)).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filtres et recherche avancés */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher utilisateur, livre, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes priorités</SelectItem>
                    <SelectItem value="high">Haute priorité (1-3)</SelectItem>
                    <SelectItem value="normal">Priorité normale (4+)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex space-x-2">
                  {selectedReservations.length > 0 && (
                    <>
                      <Button 
                        onClick={() => openBulkActionModal('approve')} 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approuver ({selectedReservations.length})
                      </Button>
                      <Button 
                        onClick={() => openBulkActionModal('cancel')} 
                        size="sm" 
                        variant="destructive"
                      >
                        Annuler ({selectedReservations.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

      {/* Tableau des réservations */}
      <Card>
        <CardHeader>                  <CardTitle>Réservations ({filteredAndSortedReservations.length})</CardTitle>
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
            <TableBody>                    {filteredAndSortedReservations.map((reservation: Reservation) => (
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

      {/* Tableau des réservations optimisé */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Réservations ({filteredAndSortedReservations.length})</CardTitle>
              <CardDescription>
                Liste complète des réservations avec tri et actions en lot
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedReservations.length === filteredAndSortedReservations.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedReservations.length === filteredAndSortedReservations.length && filteredAndSortedReservations.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('utilisateur')}
                  >
                    <div className="flex items-center">
                      Utilisateur
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('livre')}
                  >
                    <div className="flex items-center">
                      Livre
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('date_reservation')}
                  >
                    <div className="flex items-center">
                      Date réservation
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('position_file')}
                  >
                    <div className="flex items-center">
                      Position/Priorité
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('statut')}
                  >
                    <div className="flex items-center">
                      Statut
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedReservations.map((reservation) => (
                  <TableRow 
                    key={reservation.id}
                    className={`hover:bg-gray-50 ${selectedReservations.includes(reservation.id) ? 'bg-blue-50' : ''}`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedReservations.includes(reservation.id)}
                        onChange={() => handleSelectReservation(reservation.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {reservation.utilisateur.prenom} {reservation.utilisateur.nom}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {reservation.utilisateur.email}
                        </div>
                        {reservation.utilisateur.telephone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {reservation.utilisateur.telephone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.livre.titre}</div>
                        <div className="text-sm text-gray-500">
                          {reservation.livre.auteur}
                        </div>
                        <div className="text-xs text-gray-400">
                          ISBN: {reservation.livre.isbn}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(reservation.date_reservation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewModal(reservation)}
                          title="Voir les détails"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {reservation.statut === 'en_attente' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApproveModal(reservation)}
                            className="text-green-600 hover:text-green-700"
                            title="Approuver"
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
                            title="Notifier l'utilisateur"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                        {['en_attente', 'prete'].includes(reservation.statut) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCancelModal(reservation)}
                            className="text-red-600 hover:text-red-700"
                            title="Annuler"
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
          </div>

          {filteredAndSortedReservations.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Aucune réservation trouvée</p>
              <p className="text-sm text-gray-400">Modifiez vos filtres ou créez une nouvelle réservation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de visualisation améliorée */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Détails de la réservation #{selectedReservation?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-6">
              {/* Informations utilisateur et livre */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Utilisateur
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="font-medium">
                        {selectedReservation.utilisateur.prenom} {selectedReservation.utilisateur.nom}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {selectedReservation.utilisateur.email}
                      </div>
                      {selectedReservation.utilisateur.telephone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedReservation.utilisateur.telephone}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Livre
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="font-medium">{selectedReservation.livre.titre}</p>
                      <p className="text-sm text-gray-600">{selectedReservation.livre.auteur}</p>
                      <p className="text-xs text-gray-500">ISBN: {selectedReservation.livre.isbn}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Détails de la réservation */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de réservation</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedReservation.date_reservation).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedReservation.date_reservation).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Position dans la file</Label>
                  <div className="mt-1">
                    {getPriorityBadge(selectedReservation.position_file)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Statut</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedReservation.statut, selectedReservation.date_expiration)}
                  </div>
                </div>
              </div>

              {selectedReservation.statut === 'prete' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date d'expiration</Label>
                    <p className="text-sm mt-1">
                      {new Date(selectedReservation.date_expiration).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Temps restant</Label>
                    <p className={`text-sm mt-1 ${getUrgencyColor(selectedReservation.date_expiration, selectedReservation.statut)}`}>
                      {getDaysUntilExpiration(selectedReservation.date_expiration)}
                    </p>
                  </div>
                </div>
              )}

              {selectedReservation.date_notification && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de notification</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedReservation.date_notification).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              {selectedReservation.notes_admin && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes administratives</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm">{selectedReservation.notes_admin}</p>
                  </div>
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
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Approuver la réservation
            </DialogTitle>
            <DialogDescription>
              Marquer cette réservation comme prête pour <strong>{selectedReservation?.utilisateur.prenom} {selectedReservation?.utilisateur.nom}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-notes">Notes pour l'utilisateur (optionnel)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Instructions spéciales, lieu de retrait, etc..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApproveReservation} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'annulation */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Annuler la réservation
            </DialogTitle>
            <DialogDescription>
              Annuler la réservation de <strong>{selectedReservation?.utilisateur.prenom} {selectedReservation?.utilisateur.nom}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-notes">Raison de l'annulation *</Label>
              <Textarea
                id="cancel-notes"
                placeholder="Expliquez la raison de l'annulation..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCancelReservation} 
              variant="destructive"
              disabled={!actionNotes.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'actions en lot */}
      <Dialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {bulkAction === 'approve' ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Approuver les réservations sélectionnées
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2 text-red-600" />
                  Annuler les réservations sélectionnées
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {bulkAction === 'approve' 
                ? `Marquer ${selectedReservations.length} réservation(s) comme prêtes`
                : `Annuler ${selectedReservations.length} réservation(s)`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-notes">
                {bulkAction === 'approve' ? 'Notes pour les utilisateurs' : 'Raison de l\'annulation'}
                {bulkAction === 'cancel' && ' *'}
              </Label>
              <Textarea
                id="bulk-notes"
                placeholder={
                  bulkAction === 'approve' 
                    ? "Instructions communes pour tous les utilisateurs..."
                    : "Raison de l'annulation en lot..."
                }
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                required={bulkAction === 'cancel'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkActionModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleBulkAction}
              className={bulkAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={bulkAction === 'cancel' ? 'destructive' : 'default'}
              disabled={bulkAction === 'cancel' && !actionNotes.trim()}
            >
              {bulkAction === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver ({selectedReservations.length})
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler ({selectedReservations.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
