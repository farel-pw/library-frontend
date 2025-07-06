/**
 * Types TypeScript pour l'API Admin
 * 
 * Ce fichier définit tous les types utilisés pour l'interface d'administration,
 * garantissant la cohérence des données entre le frontend et le backend.
 * 
 * @author Votre Nom
 * @version 1.0.0
 */

/**
 * Structure des statistiques brutes retournées par l'API backend
 */
export interface RawApiStats {
  // Statistiques des utilisateurs
  utilisateurs?: {
    total: number
    actifs: number
    nouveaux_ce_mois?: number
  }
  
  // Statistiques des livres
  livres?: {
    total: number
    disponibles: number
    empruntes?: number
    reserves?: number
  }
  
  // Statistiques des emprunts
  emprunts?: {
    total: number
    en_cours: number
    en_retard: number
    rendus_ce_mois?: number
  }
  
  // Statistiques des réservations
  reservations?: {
    total: number
    en_attente: number
    pretes: number
    expirees?: number
  }
  
  // Statistiques des commentaires
  commentaires?: {
    total: number
    en_attente: number
    approuves?: number
    note_moyenne?: number
  }
  
  // Notifications système
  notifications?: {
    total: number
    non_lues: number
    retards: number
    reservations: number
  }
}

/**
 * Structure des statistiques du tableau de bord côté frontend
 */
export interface DashboardStats {
  totalUsers: number          // Nombre total d'utilisateurs inscrits
  activeUsers: number         // Nombre d'utilisateurs actifs
  totalBooks: number          // Nombre total de livres dans la collection
  availableBooks: number      // Nombre de livres disponibles à l'emprunt
  totalBorrows: number        // Nombre total d'emprunts
  activeBorrows: number       // Nombre d'emprunts en cours
  overdueBooks: number        // Nombre d'emprunts en retard
  pendingReservations: number // Nombre de réservations en attente
  totalComments: number       // Nombre total de commentaires
  pendingComments: number     // Nombre de commentaires en attente de modération
  notifications?: {           // Notifications système (optionnel)
    total: number
    non_lues: number
    retards: number
    reservations: number
  }
}

/**
 * Structure pour l'activité récente du système
 */
export interface RecentActivity {
  id: string              // Identifiant unique de l'activité
  type: string           // Type d'activité (emprunt, retour, inscription, etc.)
  description: string    // Description textuelle de l'activité
  timestamp: string      // Horodatage de l'activité
  user?: string         // Utilisateur associé à l'activité (optionnel)
}

/**
 * Types pour les utilisateurs
 */
export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  role: 'etudiant' | 'admin'
  useractive: boolean
  date_creation: string
  date_maj: string
}

/**
 * Types pour les livres
 */
export interface Book {
  id: number
  titre: string
  auteur: string
  genre?: string
  isbn?: string
  annee_publication?: number
  disponible: boolean
  date_ajout: string
}

/**
 * Types pour les emprunts
 */
export interface Borrow {
  id: number
  utilisateur_id: number
  livre_id: number
  date_emprunt: string
  date_retour_prevue: string
  date_retour_effective?: string
  rendu: boolean
  penalites?: number
  notes_admin?: string
}

/**
 * Types pour les réservations
 */
export interface Reservation {
  id: number
  utilisateur_id: number
  livre_id: number
  date_reservation: string
  statut: 'en_attente' | 'annulée' | 'validée' | 'prete' | 'prête'
  date_expiration?: string
}

/**
 * Types pour les commentaires
 */
export interface Comment {
  id: number
  utilisateur_id: number
  livre_id: number
  note: number
  commentaire?: string
  date_creation: string
  modere: boolean
}

/**
 * Types pour les notifications
 */
export interface Notification {
  id: number
  utilisateur_id: number
  type: 'retard' | 'reservation' | 'rappel' | 'info'
  titre: string
  message: string
  lu: boolean
  date_creation: string
  date_envoi?: string
}

/**
 * Réponse standard de l'API
 */
export interface ApiResponse<T = any> {
  error: boolean
  message?: string
  data?: T
}

/**
 * Types pour les analyses et rapports
 */
export interface AnalyticsData {
  period: string
  total_emprunts: number
  emprunts_par_jour: Array<{
    date: string
    count: number
  }>
  livres_populaires: Array<{
    livre_id: number
    titre: string
    auteur: string
    nb_emprunts: number
  }>
  utilisateurs_actifs: Array<{
    utilisateur_id: number
    nom: string
    prenom: string
    nb_emprunts: number
  }>
}
