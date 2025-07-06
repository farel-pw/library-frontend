"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  BookOpen,
  Clock,
  Settings,
  Shield,
  MoreHorizontal,
  UserPlus,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role: string
  statut: 'actif' | 'suspendu' | 'inactif'
  date_inscription: string
  derniere_connexion?: string
  emprunts_actifs: number
  reservations_actives: number
  total_emprunts: number
}

interface UserFormData {
  nom: string
  prenom: string
  email: string
  role: string
  statut: string
  mot_de_passe?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusAction, setStatusAction] = useState<'activate' | 'suspend' | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    nom: "",
    prenom: "",
    email: "",
    role: "etudiant",
    statut: "actif"
  })

  useEffect(() => {
    testApiConnection()
    fetchUsers()
  }, [])

  // Debug: Vérification de l'authentification admin
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem("adminToken")
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      
      console.log("🔍 Admin Auth Check:")
      console.log("   - adminToken:", adminToken ? "✅ Present" : "❌ Missing")
      console.log("   - token:", token ? "✅ Present" : "❌ Missing")
      console.log("   - user:", user)
      console.log("   - user role:", user.role)
      
      if (!adminToken && !token) {
        console.warn("⚠️ No authentication token found!")
      }
    }
    
    checkAdminAuth()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log("🔍 Fetching users...")
      const data = await adminApi.users.getAll()
      console.log("📊 Raw API response:", data)
      console.log("📊 Is array?", Array.isArray(data))
      console.log("📊 Data length:", data?.length)
      
      if (Array.isArray(data)) {
        setUsers(data)
        console.log("✅ Users set successfully:", data.length, "users")
      } else {
        console.warn("⚠️ Response is not an array:", typeof data, data)
        setUsers([])
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Test de connexion API
  const testApiConnection = async () => {
    try {
      console.log("🔍 Testing API connection...")
      
      // Test simple d'authentification
      const response = await fetch("http://localhost:4401/utilisateurs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || localStorage.getItem("adminToken")}`
        }
      })
      
      console.log("📡 Direct API test - Status:", response.status)
      console.log("📡 Direct API test - OK:", response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log("📡 Direct API test - Data:", data)
      } else {
        const errorText = await response.text()
        console.log("📡 Direct API test - Error:", errorText)
      }
    } catch (error) {
      console.error("📡 Direct API test - Exception:", error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || user.statut === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleCreateUser = async () => {
    try {
      await adminApi.users.create(formData)
      setIsCreateModalOpen(false)
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        role: "etudiant",
        statut: "actif"
      })
      fetchUsers()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création de l\'utilisateur')
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      await adminApi.users.update(parseInt(selectedUser.id), formData)
      setIsEditModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Erreur lors de la mise à jour de l\'utilisateur')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      await adminApi.users.delete(parseInt(selectedUser.id))
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'utilisateur')
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      await adminApi.users.toggleStatus(parseInt(userId), false)
      fetchUsers()
      setIsStatusModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Erreur lors de la suspension:', error)
      alert('Erreur lors de la suspension de l\'utilisateur')
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      await adminApi.users.toggleStatus(parseInt(userId), true)
      fetchUsers()
      setIsStatusModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error)
      alert('Erreur lors de l\'activation de l\'utilisateur')
    }
  }

  const openStatusModal = (user: User, action: 'activate' | 'suspend') => {
    setSelectedUser(user)
    setStatusAction(action)
    setIsStatusModalOpen(true)
  }

  const handleStatusAction = async () => {
    if (!selectedUser || !statusAction) return
    
    if (statusAction === 'activate') {
      await handleActivateUser(selectedUser.id)
    } else {
      await handleSuspendUser(selectedUser.id)
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      statut: user.statut
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <Badge className="bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30">Actif</Badge>
      case 'suspendu':
        return <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30 hover:bg-orange-600/30">Suspendu</Badge>
      case 'inactif':
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-600/30 hover:bg-gray-600/30">Inactif</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-600/20 text-slate-400">{statut}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 hover:bg-purple-600/30">Admin</Badge>
      case 'bibliothecaire':
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30">Bibliothécaire</Badge>
      case 'etudiant':
        return <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30 hover:bg-slate-600/30">Étudiant</Badge>
      default:
        return <Badge variant="secondary" className="bg-slate-600/20 text-slate-400">{role}</Badge>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête amélioré */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Gestion des Utilisateurs
              </h1>
              <p className="text-slate-400 mt-1">
                Administrez les comptes, rôles et accès de vos utilisateurs
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white mt-4 md:mt-0"
            size="lg"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Nouvel utilisateur
          </Button>
          
          {/* Debug button - Remove in production */}
          <Button 
            onClick={() => {
              console.log("🔄 Manual refresh triggered")
              testApiConnection()
              fetchUsers()
            }}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 mt-4 md:mt-0"
            size="lg"
          >
            🔄 Debug Refresh
          </Button>
        </div>

        {/* Statistiques rapides - Design amélioré */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Utilisateurs</p>
                  <p className="text-3xl font-bold text-white">{users.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Tous les utilisateurs</p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Comptes Actifs</p>
                  <p className="text-3xl font-bold text-green-400">
                    {users.filter(u => u.statut === 'actif').length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Utilisateurs connectés</p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Comptes Suspendus</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {users.filter(u => u.statut === 'suspendu').length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Accès bloqué</p>
                </div>
                <div className="bg-orange-600/20 p-3 rounded-lg">
                  <XCircle className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-800/70 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Administrateurs</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Accès privilégié</p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Shield className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche - Design amélioré */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Rechercher par nom, prénom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700">Tous les statuts</SelectItem>
                  <SelectItem value="actif" className="text-white hover:bg-slate-700">Actif</SelectItem>
                  <SelectItem value="suspendu" className="text-white hover:bg-slate-700">Suspendu</SelectItem>
                  <SelectItem value="inactif" className="text-white hover:bg-slate-700">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des utilisateurs - Design amélioré */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white text-xl flex items-center">
              <Users className="h-6 w-6 mr-2 text-blue-400" />
              Utilisateurs ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Liste complète des utilisateurs avec leurs informations et statistiques d'activité
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-300 font-semibold">Utilisateur</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Rôle</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Statut</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Inscription</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Activité</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.prenom[0]}{user.nom[0]}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.prenom} {user.nom}</div>
                            <div className="text-sm text-slate-400 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.statut)}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-slate-300">
                          <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                          {new Date(user.date_inscription).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-slate-400">
                            <BookOpen className="h-3 w-3 mr-1 text-blue-400" />
                            <span className="text-white font-medium">{user.emprunts_actifs}</span> emprunts
                          </div>
                          <div className="flex items-center text-xs text-slate-400">
                            <Clock className="h-3 w-3 mr-1 text-orange-400" />
                            <span className="text-white font-medium">{user.reservations_actives}</span> réservations
                          </div>
                        </div>
                      </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditModal(user)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.statut === 'actif' ? (
                          <DropdownMenuItem 
                            onClick={() => openStatusModal(user, 'suspend')}
                            className="text-orange-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspendre
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => openStatusModal(user, 'activate')}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
        </CardContent>
      </Card>

      {/* Modal de création */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouvel utilisateur au système
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="mot_de_passe">Mot de passe temporaire</Label>
              <Input
                id="mot_de_passe"
                type="password"
                value={formData.mot_de_passe || ''}
                onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etudiant">Étudiant</SelectItem>
                    <SelectItem value="bibliothecaire">Bibliothécaire</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="statut">Statut</Label>
                <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateUser}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de modification */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-prenom">Prénom</Label>
                <Input
                  id="edit-prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-nom">Nom</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Rôle</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etudiant">Étudiant</SelectItem>
                    <SelectItem value="bibliothecaire">Bibliothécaire</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-statut">Statut</Label>
                <Select value={formData.statut} onValueChange={(value) => setFormData({ ...formData, statut: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="suspendu">Suspendu</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateUser}>Modifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de suppression */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur{" "}
              <span className="font-semibold">
                {selectedUser?.prenom} {selectedUser?.nom}
              </span>{" "}
              ? Cette action est irréversible et supprimera également tout l'historique associé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de changement de statut */}
      <AlertDialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              {statusAction === 'suspend' ? (
                <>
                  <XCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Suspendre l'utilisateur
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Activer l'utilisateur
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction === 'suspend' ? (
                <>
                  Êtes-vous sûr de vouloir suspendre l'accès de{" "}
                  <span className="font-semibold">
                    {selectedUser?.prenom} {selectedUser?.nom}
                  </span>{" "}
                  ? L'utilisateur ne pourra plus se connecter tant que son compte est suspendu.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir réactiver l'accès de{" "}
                  <span className="font-semibold">
                    {selectedUser?.prenom} {selectedUser?.nom}
                  </span>{" "}
                  ? L'utilisateur pourra de nouveau se connecter et utiliser le système.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusAction}
              className={statusAction === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {statusAction === 'suspend' ? (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Suspendre
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}
