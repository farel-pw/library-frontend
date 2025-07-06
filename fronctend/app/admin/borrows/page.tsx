"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Search, 
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  RotateCcw
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

interface Borrow {
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
  date_emprunt: string
  date_retour_prevue: string
  date_retour_effective?: string
  statut: 'en_cours' | 'rendu' | 'en_retard' | 'perdu'
  penalites: number
  notes_admin?: string
}

export default function AdminBorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBorrow, setSelectedBorrow] = useState<Borrow | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [returnNotes, setReturnNotes] = useState("")
  const [renewDays, setRenewDays] = useState(7)

  useEffect(() => {
    fetchBorrows()
  }, [])

  const fetchBorrows = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getBorrows()
      setBorrows(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement des emprunts:', error)
      setBorrows([])
    } finally {
      setLoading(false)
    }
  }

  const filteredBorrows = borrows.filter(borrow => {
    const matchesSearch = 
      borrow.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrow.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrow.livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrow.livre.auteur.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || borrow.statut === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleReturnBook = async () => {
    if (!selectedBorrow) return
    
    try {
      await adminApi.returnBorrow(selectedBorrow.id, { notes_admin: returnNotes })
      setIsReturnModalOpen(false)
      setSelectedBorrow(null)
      setReturnNotes("")
      fetchBorrows()
    } catch (error) {
      console.error('Erreur lors du retour:', error)
      alert('Erreur lors du retour du livre')
    }
  }

  const handleRenewBorrow = async () => {
    if (!selectedBorrow) return
    
    try {
      await adminApi.renewBorrow(selectedBorrow.id, { days: renewDays })
      setIsRenewModalOpen(false)
      setSelectedBorrow(null)
      setRenewDays(7)
      fetchBorrows()
    } catch (error) {
      console.error('Erreur lors du renouvellement:', error)
      alert('Erreur lors du renouvellement de l\'emprunt')
    }
  }

  const openViewModal = (borrow: Borrow) => {
    setSelectedBorrow(borrow)
    setIsViewModalOpen(true)
  }

  const openReturnModal = (borrow: Borrow) => {
    setSelectedBorrow(borrow)
    setIsReturnModalOpen(true)
  }

  const openRenewModal = (borrow: Borrow) => {
    setSelectedBorrow(borrow)
    setIsRenewModalOpen(true)
  }

  const getStatusBadge = (statut: string, dateRetourPrevue: string) => {
    const today = new Date()
    const dueDate = new Date(dateRetourPrevue)
    const isOverdue = today > dueDate && statut === 'en_cours'

    switch (statut) {
      case 'en_cours':
        if (isOverdue) {
          return <Badge className="bg-red-100 text-red-800">En retard</Badge>
        }
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      case 'rendu':
        return <Badge className="bg-green-100 text-green-800">Rendu</Badge>
      case 'en_retard':
        return <Badge className="bg-red-100 text-red-800">En retard</Badge>
      case 'perdu':
        return <Badge className="bg-gray-800 text-white">Perdu</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const getDaysUntilDue = (dateRetourPrevue: string) => {
    const today = new Date()
    const dueDate = new Date(dateRetourPrevue)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} jour(s) de retard`
    } else if (diffDays === 0) {
      return "Échéance aujourd'hui"
    } else if (diffDays <= 3) {
      return `${diffDays} jour(s) restant(s)`
    } else {
      return `${diffDays} jours`
    }
  }

  const getUrgencyColor = (dateRetourPrevue: string, statut: string) => {
    if (statut !== 'en_cours') return 'text-gray-600'
    
    const today = new Date()
    const dueDate = new Date(dateRetourPrevue)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-red-600'
    if (diffDays <= 3) return 'text-orange-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const overdueBorrows = borrows.filter(b => {
    const today = new Date()
    const dueDate = new Date(b.date_retour_prevue)
    return b.statut === 'en_cours' && today > dueDate
  })

  const dueSoonBorrows = borrows.filter(b => {
    const today = new Date()
    const dueDate = new Date(b.date_retour_prevue)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return b.statut === 'en_cours' && diffDays >= 0 && diffDays <= 3
  })

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Emprunts
          </h1>
          <p className="text-gray-600 mt-1">
            Suivez et gérez tous les emprunts de livres en cours et historiques
          </p>
        </div>
        <Button onClick={fetchBorrows} variant="outline">
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
                <p className="text-sm font-medium text-gray-600">Total emprunts</p>
                <p className="text-2xl font-bold text-gray-900">{borrows.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {borrows.filter(b => b.statut === 'en_cours').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-red-600">
                  {overdueBorrows.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Échéance proche</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dueSoonBorrows.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {overdueBorrows.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                {overdueBorrows.length} emprunt(s) en retard nécessitent votre attention
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
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="rendu">Rendu</SelectItem>
                <SelectItem value="en_retard">En retard</SelectItem>
                <SelectItem value="perdu">Perdu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des emprunts */}
      <Card>
        <CardHeader>
          <CardTitle>Emprunts ({filteredBorrows.length})</CardTitle>
          <CardDescription>
            Liste complète des emprunts avec leurs statuts et échéances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Livre</TableHead>
                <TableHead>Date emprunt</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Pénalités</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBorrows.map((borrow) => (
                <TableRow key={borrow.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {borrow.utilisateur.prenom} {borrow.utilisateur.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {borrow.utilisateur.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{borrow.livre.titre}</div>
                      <div className="text-sm text-gray-500">
                        {borrow.livre.auteur}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(borrow.date_emprunt).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {new Date(borrow.date_retour_prevue).toLocaleDateString('fr-FR')}
                      </div>
                      <div className={`text-xs ${getUrgencyColor(borrow.date_retour_prevue, borrow.statut)}`}>
                        {getDaysUntilDue(borrow.date_retour_prevue)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(borrow.statut, borrow.date_retour_prevue)}
                  </TableCell>
                  <TableCell>
                    {borrow.penalites > 0 ? (
                      <span className="text-red-600 font-medium">
                        {borrow.penalites}€
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(borrow)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {borrow.statut === 'en_cours' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReturnModal(borrow)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRenewModal(borrow)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <RotateCcw className="h-3 w-3" />
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

      {/* Modal de visualisation */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'emprunt</DialogTitle>
          </DialogHeader>
          {selectedBorrow && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Utilisateur</Label>
                  <p className="text-sm">
                    {selectedBorrow.utilisateur.prenom} {selectedBorrow.utilisateur.nom}
                  </p>
                  <p className="text-xs text-gray-500">{selectedBorrow.utilisateur.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Livre</Label>
                  <p className="text-sm">{selectedBorrow.livre.titre}</p>
                  <p className="text-xs text-gray-500">{selectedBorrow.livre.auteur}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date d'emprunt</Label>
                  <p className="text-sm">
                    {new Date(selectedBorrow.date_emprunt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de retour prévue</Label>
                  <p className="text-sm">
                    {new Date(selectedBorrow.date_retour_prevue).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              {selectedBorrow.date_retour_effective && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de retour effective</Label>
                  <p className="text-sm">
                    {new Date(selectedBorrow.date_retour_effective).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Statut</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedBorrow.statut, selectedBorrow.date_retour_prevue)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Pénalités</Label>
                  <p className="text-sm">
                    {selectedBorrow.penalites > 0 ? `${selectedBorrow.penalites}€` : 'Aucune'}
                  </p>
                </div>
              </div>
              {selectedBorrow.notes_admin && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes administratives</Label>
                  <p className="text-sm mt-1">{selectedBorrow.notes_admin}</p>
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

      {/* Modal de retour */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le retour</DialogTitle>
            <DialogDescription>
              Marquer ce livre comme rendu par {selectedBorrow?.utilisateur.prenom} {selectedBorrow?.utilisateur.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="return-notes">Notes (optionnel)</Label>
              <Input
                id="return-notes"
                placeholder="État du livre, remarques..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleReturnBook} className="bg-green-600 hover:bg-green-700">
              Confirmer le retour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de renouvellement */}
      <Dialog open={isRenewModalOpen} onOpenChange={setIsRenewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renouveler l'emprunt</DialogTitle>
            <DialogDescription>
              Prolonger la durée d'emprunt pour {selectedBorrow?.utilisateur.prenom} {selectedBorrow?.utilisateur.nom}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="renew-days">Nombre de jours supplémentaires</Label>
              <Select value={renewDays.toString()} onValueChange={(value) => setRenewDays(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                  <SelectItem value="21">21 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedBorrow && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Nouvelle date de retour prévue : {' '}
                  <span className="font-medium">
                    {new Date(new Date(selectedBorrow.date_retour_prevue).getTime() + renewDays * 24 * 60 * 60 * 1000)
                      .toLocaleDateString('fr-FR')}
                  </span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRenewBorrow} className="bg-blue-600 hover:bg-blue-700">
              Renouveler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
