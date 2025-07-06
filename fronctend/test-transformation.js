// Test de la transformation des données
const rawData = {
  "total_livres": 10,
  "livres_disponibles": 10,
  "total_utilisateurs": 4,
  "utilisateurs_actifs": 4,
  "total_emprunts": 5,
  "emprunts_actifs": 4,
  "emprunts_en_retard": 2,
  "total_reservations": 4,
  "reservations_pretes": 1,
  "total_commentaires": 6,
  "note_moyenne_generale": 4.5
}

console.log('📊 Raw data from backend:', rawData)

const transformedData = {
  utilisateurs: {
    total: rawData.total_utilisateurs || 0,
    actifs: rawData.utilisateurs_actifs || rawData.total_utilisateurs || 0,
    nouveaux_ce_mois: rawData.nouveaux_utilisateurs || 0,
    tendance_utilisateurs: 0
  },
  livres: {
    total: rawData.total_livres || 0,
    disponibles: rawData.livres_disponibles || 0,
    empruntes: rawData.emprunts_actifs || 0,
    reserves: rawData.reservations_en_attente || 0,
    tendance_emprunts: 0
  },
  emprunts: {
    total: rawData.total_emprunts || 0,
    en_cours: rawData.emprunts_actifs || 0,
    en_retard: rawData.emprunts_en_retard || 0,
    rendus_ce_mois: 0,
    tendance_retards: 0
  },
  reservations: {
    total: rawData.total_reservations || 0,
    en_attente: rawData.reservations_en_attente || 0,
    pretes: rawData.reservations_pretes || 0,
    expirees: 0,
    tendance_reservations: 0
  },
  commentaires: {
    total: rawData.total_commentaires || 0,
    en_attente: 0,
    approuves: 0,
    note_moyenne: rawData.note_moyenne_generale || 0,
    tendance_avis: 0
  },
  notifications: {
    total: rawData.total_notifications || 0,
    non_lues: rawData.notifications_non_lues || 0,
    retards: rawData.notifications_retard || 0,
    reservations: rawData.notifications_reservations || 0
  }
}

console.log('📊 Transformed data:', transformedData)

// Test ce que le dashboard reçoit
const dashboardStats = {
  totalUsers: transformedData.utilisateurs?.total || 0,
  activeUsers: transformedData.utilisateurs?.actifs || 0,
  totalBooks: transformedData.livres?.total || 0,
  availableBooks: transformedData.livres?.disponibles || 0,
  totalBorrows: transformedData.emprunts?.total || 0,
  activeBorrows: transformedData.emprunts?.en_cours || 0,
  overdueBooks: transformedData.emprunts?.en_retard || 0,
  pendingReservations: transformedData.reservations?.en_attente || 0,
  totalComments: transformedData.commentaires?.total || 0,
  pendingComments: transformedData.commentaires?.en_attente || 0,
}

console.log('📊 Dashboard stats:', dashboardStats)
