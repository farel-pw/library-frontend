"use client"

import React, { useEffect, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database,
  Mail,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Server,
  Key,
  Bell,
  FileText,
  Users,
  BookOpen
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface SystemSettings {
  generale: {
    nom_bibliotheque: string
    description: string
    adresse: string
    telephone: string
    email: string
    horaires: string
    maintenance_mode: boolean
    message_maintenance: string
  }
  emprunts: {
    duree_emprunt_defaut: number
    duree_emprunt_max: number
    nombre_emprunts_max: number
    nombre_renouvellements_max: number
    penalite_par_jour: number
    duree_grace: number
  }
  reservations: {
    duree_reservation: number
    nombre_reservations_max: number
    notification_avant_expiration: number
    annulation_automatique: boolean
  }
  notifications: {
    email_enabled: boolean
    sms_enabled: boolean
    rappel_echeance: number
    rappel_retard: number
    notification_reservation: boolean
    notification_nouveau_livre: boolean
  }
  securite: {
    session_timeout: number
    max_tentatives_connexion: number
    duree_blocage: number
    force_password_change: boolean
    password_min_length: number
    enable_2fa: boolean
  }
  sauvegarde: {
    auto_backup: boolean
    backup_frequency: string
    backup_retention: number
    backup_location: string
  }
}

interface SystemStatus {
  database: {
    status: 'connected' | 'disconnected' | 'error'
    version: string
    size: string
    last_backup: string
  }
  server: {
    status: 'running' | 'stopped' | 'error'
    uptime: string
    memory_usage: number
    cpu_usage: number
  }
  services: {
    email: boolean
    notifications: boolean
    scheduler: boolean
    backup: boolean
  }
}

export default function AdminSystemPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("generale")

  useEffect(() => {
    fetchSystemData()
    const interval = setInterval(fetchSystemStatus, 30000) // Rafraîchir le statut toutes les 30s
    return () => clearInterval(interval)
  }, [])

  const fetchSystemData = async () => {
    try {
      setLoading(true)
      const [settingsData, statusData] = await Promise.all([
        adminApi.getSystemSettings(),
        adminApi.getSystemStatus()
      ])
      
      setSettings(settingsData)
      setStatus(statusData)
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const statusData = await adminApi.getSystemStatus()
      setStatus(statusData)
    } catch (error) {
      console.error('Erreur lors du chargement du statut:', error)
    }
  }

  const updateSettings = async (section: keyof SystemSettings, newSettings: any) => {
    if (!settings) return
    
    const updatedSettings = {
      ...settings,
      [section]: { ...settings[section], ...newSettings }
    }
    
    setSettings(updatedSettings)
  }

  const saveSettings = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      await adminApi.updateSystemSettings(settings)
      alert('Paramètres sauvegardés avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setSaving(false)
    }
  }

  const createBackup = async () => {
    try {
      await adminApi.createBackup()
      alert('Sauvegarde créée avec succès')
      fetchSystemStatus()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la création de la sauvegarde')
    }
  }

  const testEmailConfig = async () => {
    try {
      await adminApi.testEmailConfig()
      alert('Test d\'email envoyé avec succès')
    } catch (error) {
      console.error('Erreur lors du test email:', error)
      alert('Erreur lors du test d\'email')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'running':
        return <Badge className="bg-green-100 text-green-800">Connecté</Badge>
      case 'disconnected':
      case 'stopped':
        return <Badge className="bg-red-100 text-red-800">Déconnecté</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getServiceStatus = (enabled: boolean) => {
    return enabled ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
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
            <Settings className="h-8 w-8 mr-3 text-blue-600" />
            Paramètres Système
          </h1>
          <p className="text-gray-600 mt-1">
            Configuration et administration du système de bibliothèque
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchSystemData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statut du système */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Base de données</p>
                  <p className="text-xs text-gray-500">{status.database.version}</p>
                </div>
                <div className="text-right">
                  <Database className="h-8 w-8 text-blue-600 mb-2" />
                  {getStatusBadge(status.database.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Serveur</p>
                  <p className="text-xs text-gray-500">Uptime: {status.server.uptime}</p>
                </div>
                <div className="text-right">
                  <Server className="h-8 w-8 text-green-600 mb-2" />
                  {getStatusBadge(status.server.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mémoire</p>
                  <p className="text-xs text-gray-500">{status.server.memory_usage}% utilisée</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-2 bg-gray-200 rounded-full mb-2">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${status.server.memory_usage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">{status.server.memory_usage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Services</p>
                  <p className="text-xs text-gray-500">
                    {Object.values(status.services).filter(Boolean).length}/4 actifs
                  </p>
                </div>
                <div className="text-right">
                  <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                  <div className="space-y-1">
                    {Object.values(status.services).filter(Boolean).length === 4 ? (
                      <Badge className="bg-green-100 text-green-800">Tous actifs</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Partiels</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Paramètres */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration du système</CardTitle>
            <CardDescription>
              Ajustez les paramètres de fonctionnement de la bibliothèque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="generale">Général</TabsTrigger>
                <TabsTrigger value="emprunts">Emprunts</TabsTrigger>
                <TabsTrigger value="reservations">Réservations</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="securite">Sécurité</TabsTrigger>
                <TabsTrigger value="sauvegarde">Sauvegarde</TabsTrigger>
              </TabsList>

              <TabsContent value="generale" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nom-bibliotheque">Nom de la bibliothèque</Label>
                    <Input
                      id="nom-bibliotheque"
                      value={settings.generale.nom_bibliotheque}
                      onChange={(e) => updateSettings('generale', { nom_bibliotheque: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email de contact</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.generale.email}
                      onChange={(e) => updateSettings('generale', { email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settings.generale.description}
                    onChange={(e) => updateSettings('generale', { description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={settings.generale.telephone}
                      onChange={(e) => updateSettings('generale', { telephone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      value={settings.generale.adresse}
                      onChange={(e) => updateSettings('generale', { adresse: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="horaires">Horaires d'ouverture</Label>
                  <Textarea
                    id="horaires"
                    value={settings.generale.horaires}
                    onChange={(e) => updateSettings('generale', { horaires: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance-mode"
                    checked={settings.generale.maintenance_mode}
                    onCheckedChange={(checked) => updateSettings('generale', { maintenance_mode: checked })}
                  />
                  <Label htmlFor="maintenance-mode">Mode maintenance</Label>
                </div>
                {settings.generale.maintenance_mode && (
                  <div>
                    <Label htmlFor="message-maintenance">Message de maintenance</Label>
                    <Textarea
                      id="message-maintenance"
                      value={settings.generale.message_maintenance}
                      onChange={(e) => updateSettings('generale', { message_maintenance: e.target.value })}
                      rows={2}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="emprunts" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duree-emprunt">Durée d'emprunt par défaut (jours)</Label>
                    <Input
                      id="duree-emprunt"
                      type="number"
                      value={settings.emprunts.duree_emprunt_defaut}
                      onChange={(e) => updateSettings('emprunts', { duree_emprunt_defaut: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duree-emprunt-max">Durée d'emprunt maximale (jours)</Label>
                    <Input
                      id="duree-emprunt-max"
                      type="number"
                      value={settings.emprunts.duree_emprunt_max}
                      onChange={(e) => updateSettings('emprunts', { duree_emprunt_max: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emprunts-max">Nombre d'emprunts maximum</Label>
                    <Input
                      id="emprunts-max"
                      type="number"
                      value={settings.emprunts.nombre_emprunts_max}
                      onChange={(e) => updateSettings('emprunts', { nombre_emprunts_max: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="renouvellements-max">Nombre de renouvellements maximum</Label>
                    <Input
                      id="renouvellements-max"
                      type="number"
                      value={settings.emprunts.nombre_renouvellements_max}
                      onChange={(e) => updateSettings('emprunts', { nombre_renouvellements_max: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="penalite">Pénalité par jour de retard (€)</Label>
                    <Input
                      id="penalite"
                      type="number"
                      step="0.01"
                      value={settings.emprunts.penalite_par_jour}
                      onChange={(e) => updateSettings('emprunts', { penalite_par_jour: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duree-grace">Durée de grâce (jours)</Label>
                    <Input
                      id="duree-grace"
                      type="number"
                      value={settings.emprunts.duree_grace}
                      onChange={(e) => updateSettings('emprunts', { duree_grace: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reservations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duree-reservation">Durée de réservation (jours)</Label>
                    <Input
                      id="duree-reservation"
                      type="number"
                      value={settings.reservations.duree_reservation}
                      onChange={(e) => updateSettings('reservations', { duree_reservation: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reservations-max">Nombre de réservations maximum</Label>
                    <Input
                      id="reservations-max"
                      type="number"
                      value={settings.reservations.nombre_reservations_max}
                      onChange={(e) => updateSettings('reservations', { nombre_reservations_max: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notification-expiration">Notification avant expiration (heures)</Label>
                  <Input
                    id="notification-expiration"
                    type="number"
                    value={settings.reservations.notification_avant_expiration}
                    onChange={(e) => updateSettings('reservations', { notification_avant_expiration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="annulation-auto"
                    checked={settings.reservations.annulation_automatique}
                    onCheckedChange={(checked) => updateSettings('reservations', { annulation_automatique: checked })}
                  />
                  <Label htmlFor="annulation-auto">Annulation automatique des réservations expirées</Label>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email-enabled"
                      checked={settings.notifications.email_enabled}
                      onCheckedChange={(checked) => updateSettings('notifications', { email_enabled: checked })}
                    />
                    <Label htmlFor="email-enabled">Notifications par email</Label>
                    <Button variant="outline" size="sm" onClick={testEmailConfig}>
                      <Mail className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sms-enabled"
                      checked={settings.notifications.sms_enabled}
                      onCheckedChange={(checked) => updateSettings('notifications', { sms_enabled: checked })}
                    />
                    <Label htmlFor="sms-enabled">Notifications par SMS</Label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rappel-echeance">Rappel d'échéance (jours avant)</Label>
                    <Input
                      id="rappel-echeance"
                      type="number"
                      value={settings.notifications.rappel_echeance}
                      onChange={(e) => updateSettings('notifications', { rappel_echeance: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rappel-retard">Rappel de retard (jours après)</Label>
                    <Input
                      id="rappel-retard"
                      type="number"
                      value={settings.notifications.rappel_retard}
                      onChange={(e) => updateSettings('notifications', { rappel_retard: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notif-reservation"
                      checked={settings.notifications.notification_reservation}
                      onCheckedChange={(checked) => updateSettings('notifications', { notification_reservation: checked })}
                    />
                    <Label htmlFor="notif-reservation">Notification de réservation prête</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notif-nouveau-livre"
                      checked={settings.notifications.notification_nouveau_livre}
                      onCheckedChange={(checked) => updateSettings('notifications', { notification_nouveau_livre: checked })}
                    />
                    <Label htmlFor="notif-nouveau-livre">Notification de nouveau livre</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="securite" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-timeout">Timeout de session (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.securite.session_timeout}
                      onChange={(e) => updateSettings('securite', { session_timeout: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-tentatives">Tentatives de connexion max</Label>
                    <Input
                      id="max-tentatives"
                      type="number"
                      value={settings.securite.max_tentatives_connexion}
                      onChange={(e) => updateSettings('securite', { max_tentatives_connexion: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duree-blocage">Durée de blocage (minutes)</Label>
                    <Input
                      id="duree-blocage"
                      type="number"
                      value={settings.securite.duree_blocage}
                      onChange={(e) => updateSettings('securite', { duree_blocage: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-length">Longueur minimale du mot de passe</Label>
                    <Input
                      id="password-length"
                      type="number"
                      value={settings.securite.password_min_length}
                      onChange={(e) => updateSettings('securite', { password_min_length: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="force-password-change"
                      checked={settings.securite.force_password_change}
                      onCheckedChange={(checked) => updateSettings('securite', { force_password_change: checked })}
                    />
                    <Label htmlFor="force-password-change">Forcer le changement de mot de passe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enable-2fa"
                      checked={settings.securite.enable_2fa}
                      onCheckedChange={(checked) => updateSettings('securite', { enable_2fa: checked })}
                    />
                    <Label htmlFor="enable-2fa">Authentification à deux facteurs</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sauvegarde" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-backup"
                    checked={settings.sauvegarde.auto_backup}
                    onCheckedChange={(checked) => updateSettings('sauvegarde', { auto_backup: checked })}
                  />
                  <Label htmlFor="auto-backup">Sauvegarde automatique</Label>
                </div>
                {settings.sauvegarde.auto_backup && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="backup-frequency">Fréquence de sauvegarde</Label>
                        <Select
                          value={settings.sauvegarde.backup_frequency}
                          onValueChange={(value) => updateSettings('sauvegarde', { backup_frequency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Toutes les heures</SelectItem>
                            <SelectItem value="daily">Quotidienne</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                            <SelectItem value="monthly">Mensuelle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="backup-retention">Rétention (jours)</Label>
                        <Input
                          id="backup-retention"
                          type="number"
                          value={settings.sauvegarde.backup_retention}
                          onChange={(e) => updateSettings('sauvegarde', { backup_retention: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="backup-location">Emplacement de sauvegarde</Label>
                      <Input
                        id="backup-location"
                        value={settings.sauvegarde.backup_location}
                        onChange={(e) => updateSettings('sauvegarde', { backup_location: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <Button onClick={createBackup} variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Créer une sauvegarde maintenant
                  </Button>
                  {status?.database.last_backup && (
                    <p className="text-sm text-gray-600">
                      Dernière sauvegarde : {new Date(status.database.last_backup).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
