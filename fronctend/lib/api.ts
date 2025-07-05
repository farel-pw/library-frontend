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

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  
  // Gestion moderne des erreurs du backend
  if (data.error) {
    throw new Error(data.message || "Erreur du serveur")
  }

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
    const response = await apiCall("/retours", {
      method: "POST",
      body: JSON.stringify({ emprunt_id: empruntId }),
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
    const response = await apiCall(`/commentaires/${livreId}`)
    return response.data || []
  },
  ajouterCommentaire: async (commentaire: any) => {
    const response = await apiCall("/commentaires", {
      method: "POST",
      body: JSON.stringify(commentaire),
    })
    return response
  },
}
