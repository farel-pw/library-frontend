"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  FileText, 
  Download, 
  Calendar,
  Clock,
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Filter
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ReportTemplate {
  id: string
  nom: string
  description: string
  type: 'utilisateurs' | 'livres' | 'emprunts' | 'reservations' | 'financier' | 'activite'
  frequence: 'manuel' | 'quotidien' | 'hebdomadaire' | 'mensuel'
  statut: 'actif' | 'inactif'
  derniere_generation?: string
  parametres: Record<string, any>
}

interface GeneratedReport {
  id: string
  nom: string
  type: string
  date_generation: string
  taille: string
  statut: 'en_cours' | 'termine' | 'erreur'
  url_telechargement?: string
}

interface ReportFilters {
  date_debut: string
  date_fin: string
  types: string[]
  utilisateurs: string[]
  livres: string[]
  statuts: string[]
}

export default function AdminReportsPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCustomReportModalOpen, setIsCustomReportModalOpen] = useState(false)
  
  const [newTemplate, setNewTemplate] = useState({
    nom: "",
    description: "",
    type: "utilisateurs" as const,
    frequence: "manuel" as const
  })

  const [customFilters, setCustomFilters] = useState<ReportFilters>({
    date_debut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    types: [],
    utilisateurs: [],
    livres: [],
    statuts: []
  })

  const reportTypes = [
    { id: 'utilisateurs', name: 'Rapport Utilisateurs', icon: Users },
    { id: 'livres', name: 'Rapport Livres', icon: BookOpen },
    { id: 'emprunts', name: 'Rapport Emprunts', icon: BookOpen },
    { id: 'reservations', name: 'Rapport Réservations', icon: Clock },
    { id: 'financier', name: 'Rapport Financier', icon: TrendingUp },
    { id: 'activite', name: 'Rapport d\'Activité', icon: BarChart3 }
  ]

  const predefinedReports = [
    {
      id: 'emprunts_en_retard',
      name: 'Emprunts en retard',
      description: 'Liste des emprunts non rendus après la date d\'échéance'
    },
    {
      id: 'utilisateurs_actifs',
      name: 'Utilisateurs actifs',
      description: 'Utilisateurs ayant emprunté au moins un livre ce mois'
    },
    {
      id: 'livres_populaires',
      name: 'Livres populaires',
      description: 'Classement des livres les plus empruntés'
    },
    {
      id: 'statistiques_mensuelles',
      name: 'Statistiques mensuelles',
      description: 'Résumé complet des activités du mois'
    },
    {
      id: 'inventaire_complet',
      name: 'Inventaire complet',
      description: 'État détaillé de tous les livres et exemplaires'
    }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [templatesData, reportsData] = await Promise.all([
        adminApi.getReportTemplates(),
        adminApi.getGeneratedReports()
      ])
      
      setTemplates(Array.isArray(templatesData) ? templatesData : [])
      setReports(Array.isArray(reportsData) ? reportsData : [])
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      setTemplates([])
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const generatePredefinedReport = async (reportId: string) => {
    try {
      setGenerating(reportId)
      await adminApi.generatePredefinedReport(reportId, customFilters)
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
      alert('Erreur lors de la génération du rapport')
    } finally {
      setGenerating(null)
    }
  }

  const generateCustomReport = async () => {
    try {
      setGenerating('custom')
      await adminApi.generateCustomReport({
        nom: `Rapport personnalisé - ${new Date().toLocaleDateString('fr-FR')}`,
        filtres: customFilters
      })
      setIsCustomReportModalOpen(false)
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
      alert('Erreur lors de la génération du rapport personnalisé')
    } finally {
      setGenerating(null)
    }
  }

  const createTemplate = async () => {
    try {
      await adminApi.createReportTemplate(newTemplate)
      setIsCreateModalOpen(false)
      setNewTemplate({
        nom: "",
        description: "",
        type: "utilisateurs",
        frequence: "manuel"
      })
      fetchData()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création du modèle')
    }
  }

  const downloadReport = async (reportId: string) => {
    try {
      const blob = await adminApi.downloadReport(reportId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport_${reportId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement du rapport')
    }
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'termine':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>
      case 'en_cours':
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      case 'erreur':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = reportTypes.find(t => t.id === type)
    return typeConfig ? (
      <Badge variant="outline">{typeConfig.name}</Badge>
    ) : (
      <Badge variant="outline">{type}</Badge>
    )
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
            <FileText className="h-8 w-8 mr-3 text-blue-600" />
            Génération de Rapports
          </h1>
          <p className="text-gray-600 mt-1">
            Créez et gérez des rapports détaillés sur l'activité de la bibliothèque
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setIsCustomReportModalOpen(true)} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Rapport personnalisé
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Nouveau modèle
          </Button>
        </div>
      </div>

      {/* Rapports prédéfinis */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports prédéfinis</CardTitle>
          <CardDescription>
            Générez rapidement des rapports standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{report.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <Button
                    onClick={() => generatePredefinedReport(report.id)}
                    disabled={generating === report.id}
                    className="w-full"
                    size="sm"
                  >
                    {generating === report.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Générer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modèles de rapport */}
      <Card>
        <CardHeader>
          <CardTitle>Modèles de rapport</CardTitle>
          <CardDescription>
            Modèles personnalisés et automatisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière génération</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.nom}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(template.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.frequence}</Badge>
                    </TableCell>
                    <TableCell>
                      {template.statut === 'actif' ? (
                        <Badge className="bg-green-100 text-green-800">Actif</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {template.derniere_generation ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(template.derniere_generation).toLocaleDateString('fr-FR')}
                        </div>
                      ) : (
                        <span className="text-gray-400">Jamais</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePredefinedReport(template.id)}
                        disabled={generating === template.id}
                      >
                        {generating === template.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun modèle de rapport configuré
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rapports générés */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports générés</CardTitle>
          <CardDescription>
            Historique des rapports avec liens de téléchargement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date de génération</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.nom}</TableCell>
                    <TableCell>{getTypeBadge(report.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(report.date_generation).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>{report.taille}</TableCell>
                    <TableCell>{getStatusBadge(report.statut)}</TableCell>
                    <TableCell>
                      {report.statut === 'termine' && report.url_telechargement && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report.id)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Télécharger
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun rapport généré récemment
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création de modèle */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau modèle de rapport</DialogTitle>
            <DialogDescription>
              Configurez un modèle de rapport personnalisé
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Nom du modèle</Label>
              <Input
                id="template-name"
                value={newTemplate.nom}
                onChange={(e) => setNewTemplate({ ...newTemplate, nom: e.target.value })}
                placeholder="Nom du rapport..."
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Description du rapport..."
              />
            </div>
            <div>
              <Label htmlFor="template-type">Type de rapport</Label>
              <Select 
                value={newTemplate.type} 
                onValueChange={(value: any) => setNewTemplate({ ...newTemplate, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template-frequency">Fréquence</Label>
              <Select 
                value={newTemplate.frequence} 
                onValueChange={(value: any) => setNewTemplate({ ...newTemplate, frequence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manuel">Manuel</SelectItem>
                  <SelectItem value="quotidien">Quotidien</SelectItem>
                  <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                  <SelectItem value="mensuel">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={createTemplate} disabled={!newTemplate.nom || !newTemplate.description}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de rapport personnalisé */}
      <Dialog open={isCustomReportModalOpen} onOpenChange={setIsCustomReportModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Générer un rapport personnalisé</DialogTitle>
            <DialogDescription>
              Configurez les filtres et paramètres pour votre rapport
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-debut">Date de début</Label>
                <Input
                  id="date-debut"
                  type="date"
                  value={customFilters.date_debut}
                  onChange={(e) => setCustomFilters({ ...customFilters, date_debut: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date-fin">Date de fin</Label>
                <Input
                  id="date-fin"
                  type="date"
                  value={customFilters.date_fin}
                  onChange={(e) => setCustomFilters({ ...customFilters, date_fin: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Types de données à inclure</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {reportTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={customFilters.types.includes(type.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCustomFilters({
                            ...customFilters,
                            types: [...customFilters.types, type.id]
                          })
                        } else {
                          setCustomFilters({
                            ...customFilters,
                            types: customFilters.types.filter(t => t !== type.id)
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`type-${type.id}`} className="text-sm">
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomReportModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={generateCustomReport} 
              disabled={generating === 'custom' || customFilters.types.length === 0}
            >
              {generating === 'custom' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Générer le rapport
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
