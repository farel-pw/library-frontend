import { getApiUrl } from "./api-config"

export async function adminApiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("adminToken")

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
  
  if (data.error) {
    throw new Error(data.message || "Erreur du serveur")
  }

  return data
}

export const adminApi = {
  // Statistiques générales
  getStats: async () => {
    const response = await adminApiCall("/admin/stats")
    return response.data || {}
  },

  // Gestion des utilisateurs
  users: {
    getAll: async () => {
      const response = await adminApiCall("/admin/utilisateurs")
      return response.data || []
    },
    getById: async (id: number) => {
      const response = await adminApiCall(`/admin/utilisateurs/${id}`)
      return response.data
    },
    create: async (userData: any) => {
      const response = await adminApiCall("/admin/utilisateurs", {
        method: "POST",
        body: JSON.stringify(userData),
      })
      return response
    },
    update: async (id: number, userData: any) => {
      const response = await adminApiCall(`/admin/utilisateurs/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      })
      return response
    },
    delete: async (id: number) => {
      const response = await adminApiCall(`/admin/utilisateurs/${id}`, {
        method: "DELETE",
      })
      return response
    },
    toggleStatus: async (id: number, active: boolean) => {
      const response = await adminApiCall(`/admin/utilisateurs/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ active }),
      })
      return response
    },
  },

  // Gestion des livres
  books: {
    getAll: async () => {
      const response = await adminApiCall("/admin/livres")
      return response.data || []
    },
    getById: async (id: number) => {
      const response = await adminApiCall(`/admin/livres/${id}`)
      return response.data
    },
    create: async (bookData: any) => {
      const response = await adminApiCall("/admin/livres", {
        method: "POST",
        body: JSON.stringify(bookData),
      })
      return response
    },
    update: async (id: number, bookData: any) => {
      const response = await adminApiCall(`/admin/livres/${id}`, {
        method: "PUT",
        body: JSON.stringify(bookData),
      })
      return response
    },
    delete: async (id: number) => {
      const response = await adminApiCall(`/admin/livres/${id}`, {
        method: "DELETE",
      })
      return response
    },
    toggleAvailability: async (id: number, disponible: boolean) => {
      const response = await adminApiCall(`/admin/livres/${id}/availability`, {
        method: "PUT",
        body: JSON.stringify({ disponible }),
      })
      return response
    },
  },

  // Gestion des emprunts
  borrows: {
    getAll: async () => {
      const response = await adminApiCall("/admin/emprunts")
      return response.data || []
    },
    getById: async (id: number) => {
      const response = await adminApiCall(`/admin/emprunts/${id}`)
      return response.data
    },
    create: async (borrowData: any) => {
      const response = await adminApiCall("/admin/emprunts", {
        method: "POST",
        body: JSON.stringify(borrowData),
      })
      return response
    },
    returnBook: async (id: number) => {
      const response = await adminApiCall(`/admin/emprunts/${id}/return`, {
        method: "PUT",
      })
      return response
    },
    extend: async (id: number, newDate: string) => {
      const response = await adminApiCall(`/admin/emprunts/${id}/extend`, {
        method: "PUT",
        body: JSON.stringify({ newDate }),
      })
      return response
    },
  },

  // Gestion des réservations
  reservations: {
    getAll: async () => {
      const response = await adminApiCall("/admin/reservations")
      return response.data || []
    },
    getById: async (id: number) => {
      const response = await adminApiCall(`/admin/reservations/${id}`)
      return response.data
    },
    approve: async (id: number) => {
      const response = await adminApiCall(`/admin/reservations/${id}/approve`, {
        method: "PUT",
      })
      return response
    },
    reject: async (id: number, reason?: string) => {
      const response = await adminApiCall(`/admin/reservations/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      })
      return response
    },
    delete: async (id: number) => {
      const response = await adminApiCall(`/admin/reservations/${id}`, {
        method: "DELETE",
      })
      return response
    },
  },

  // Gestion des commentaires
  comments: {
    getAll: async () => {
      const response = await adminApiCall("/admin/commentaires")
      return response.data || []
    },
    getById: async (id: number) => {
      const response = await adminApiCall(`/admin/commentaires/${id}`)
      return response.data
    },
    moderate: async (id: number, action: 'approve' | 'reject') => {
      const response = await adminApiCall(`/admin/commentaires/${id}/moderate`, {
        method: "PUT",
        body: JSON.stringify({ action }),
      })
      return response
    },
    delete: async (id: number) => {
      const response = await adminApiCall(`/admin/commentaires/${id}`, {
        method: "DELETE",
      })
      return response
    },
  },

  // Rapports et analyses
  reports: {
    getBorrowStats: async (period?: string) => {
      const params = period ? `?period=${period}` : ""
      const response = await adminApiCall(`/admin/reports/borrows${params}`)
      return response.data || {}
    },
    getUserStats: async () => {
      const response = await adminApiCall("/admin/reports/users")
      return response.data || {}
    },
    getBookStats: async () => {
      const response = await adminApiCall("/admin/reports/books")
      return response.data || {}
    },
    getOverdueBooks: async () => {
      const response = await adminApiCall("/admin/reports/overdue")
      return response.data || []
    },
  },

  // Système
  system: {
    backup: async () => {
      const response = await adminApiCall("/admin/system/backup", {
        method: "POST",
      })
      return response
    },
    getLogs: async (level?: string) => {
      const params = level ? `?level=${level}` : ""
      const response = await adminApiCall(`/admin/system/logs${params}`)
      return response.data || []
    },
    getSettings: async () => {
      const response = await adminApiCall("/admin/system/settings")
      return response.data || {}
    },
    updateSettings: async (settings: any) => {
      const response = await adminApiCall("/admin/system/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      })
      return response
    },
  },
}
