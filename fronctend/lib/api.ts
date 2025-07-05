const API_BASE_URL = "http://localhost:4001"

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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const api = {
  // Livres
  getLivres: (filters?: { titre?: string; auteur?: string; genre?: string }) => {
    const params = new URLSearchParams()
    if (filters?.titre) params.append("titre", filters.titre)
    if (filters?.auteur) params.append("auteur", filters.auteur)
    if (filters?.genre) params.append("genre", filters.genre)

    return apiCall(`/livres?${params.toString()}`)
  },

  // Emprunts
  getEmprunts: () => apiCall("/emprunts"),
  emprunterLivre: (livreId: number) =>
    apiCall("/emprunts", {
      method: "POST",
      body: JSON.stringify({ livre_id: livreId }),
    }),
  retournerLivre: (empruntId: number) =>
    apiCall("/retours", {
      method: "POST",
      body: JSON.stringify({ emprunt_id: empruntId }),
    }),

  // Admin - Livres
  admin: {
    getLivres: () => apiCall("/admin/livres"),
    ajouterLivre: (livre: any) =>
      apiCall("/admin/livres", {
        method: "POST",
        body: JSON.stringify(livre),
      }),
    modifierLivre: (id: number, livre: any) =>
      apiCall(`/admin/livres/${id}`, {
        method: "PUT",
        body: JSON.stringify(livre),
      }),
    supprimerLivre: (id: number) => apiCall(`/admin/livres/${id}`, { method: "DELETE" }),

    // Étudiants
    getEtudiants: () => apiCall("/admin/etudiants"),
    modifierEtudiant: (id: number, data: any) =>
      apiCall(`/admin/etudiants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    supprimerEtudiant: (id: number) => apiCall(`/admin/etudiants/${id}`, { method: "DELETE" }),
  },

  // Commentaires
  getCommentaires: (livreId: number) => apiCall(`/commentaires/${livreId}`),
  ajouterCommentaire: (commentaire: any) =>
    apiCall("/commentaires", {
      method: "POST",
      body: JSON.stringify(commentaire),
    }),
}
