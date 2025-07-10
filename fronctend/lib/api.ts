import { getApiUrl } from "./api-config"

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(getApiUrl(endpoint), config)

  // Gestion spéciale pour les erreurs d'authentification
  if (response.status === 401) {
    // Token expiré ou invalide, rediriger vers la connexion
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/connexion"
    throw new Error("Session expirée. Veuillez vous reconnecter.")
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  // Retourner les données telles quelles, y compris les erreurs
  // Le composant gérera les erreurs lui-même
  return data
}

export const api = {
  // Livres
  getLivres: async (filters?: { titre?: string; auteur?: string; genre?: string }) => {
    const params = new URLSearchParams()
    if (filters?.titre) params.append("titre", filters.titre)
    if (filters?.auteur) params.append("auteur", filters.auteur)
    if (filters?.genre && filters.genre !== "all") params.append("genre", filters.genre)

    const response = await apiCall(`/livres?${params.toString()}`)
    return response.data || []
  },

  // Emprunts
  getEmprunts: async () => {
    const response = await apiCall("/emprunts")
    return response.data || []
  },
  emprunterLivre: async (livreId: number) => {
    const response = await apiCall("/emprunts", {
      method: "POST",
      body: JSON.stringify({ livre_id: livreId }),
    })
    return response
  },
  retournerLivre: async (empruntId: number) => {
    const response = await apiCall(`/emprunts/retour/${empruntId}`, {
      method: "PUT",
    })
    return response
  },

  // Réservations
  getReservations: async () => {
    const response = await apiCall("/reservations")
    return response.data || []
  },
  reserverLivre: async (livreId: number) => {
    const response = await apiCall("/reservations", {
      method: "POST",
      body: JSON.stringify({ livre_id: livreId }),
    })
    return response
  },
  annulerReservation: async (reservationId: number) => {
    const response = await apiCall(`/reservations/${reservationId}`, {
      method: "DELETE",
    })
    return response
  },

  // Admin - Livres
  admin: {
    getLivres: async () => {
      const response = await apiCall("/admin/livres")
      return response.data || []
    },
    ajouterLivre: async (livre: any) => {
      const response = await apiCall("/admin/livres", {
        method: "POST",
        body: JSON.stringify(livre),
      })
      return response
    },
    modifierLivre: async (id: number, livre: any) => {
      const response = await apiCall(`/admin/livres/${id}`, {
        method: "PUT",
        body: JSON.stringify(livre),
      })
      return response
    },
    supprimerLivre: async (id: number) => {
      const response = await apiCall(`/admin/livres/${id}`, { method: "DELETE" })
      return response
    },

    // Étudiants
    getEtudiants: async () => {
      const response = await apiCall("/admin/etudiants")
      return response.data || []
    },
    modifierEtudiant: async (id: number, data: any) => {
      const response = await apiCall(`/admin/etudiants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
      return response
    },
    supprimerEtudiant: async (id: number) => {
      const response = await apiCall(`/admin/etudiants/${id}`, { method: "DELETE" })
      return response
    },
  },

  // Commentaires
  getCommentaires: async (livreId: number) => {
    const response = await apiCall(`/commentaires/livre/${livreId}`)
    return response.data || []
  },
  ajouterCommentaire: async (commentaire: any) => {
    const response = await apiCall("/commentaires", {
      method: "POST",
      body: JSON.stringify(commentaire),
    })
    return response
  },

  // Commentaires Bibliothèque
  getBibliothequeCommentaires: async () => {
    const response = await apiCall("/commentaires/bibliotheque")
    return response.data || []
  },
  ajouterBibliothequeCommentaire: async (commentaire: any) => {
    const response = await apiCall("/commentaires/bibliotheque", {
      method: "POST",
      body: JSON.stringify(commentaire),
    })
    return response
  },
  getBibliothequeStats: async () => {
    const response = await apiCall("/commentaires/bibliotheque/stats")
    return response.data || {}
  },

  // API pour le profil utilisateur
  getUserEmprunts: async () => {
    const response = await apiCall("/emprunts")
    return response.data || []
  },
  getUserReservations: async () => {
    const response = await apiCall("/reservations")
    return response.data || []
  },
  getUserCommentaires: async () => {
    const response = await apiCall("/commentaires/user")
    return response.data || []
  },
  updateUserProfile: async (userData: any) => {
    const response = await apiCall("/utilisateurs", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
    return response
  },
}
