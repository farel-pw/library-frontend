import { getApiUrl } from "./api-config"

export async function adminApiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

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
    const errorText = await response.text()
    console.error("❌ API Error:", response.status, errorText)
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
  }

  const data = await response.json()
  
  if (data.error) {
    console.error("❌ API Error from data:", data.message)
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
      const response = await adminApiCall("/utilisateurs")
      console.log("👥 Users API Response:", response)
      
      // Le backend retourne { error: false, data: users }
      if (response.error === false && response.data) {
        return response.data
      }
      
      // Fallback si la structure est différente
      return response.data || response || []
    },
    getById: async (id: number) => {
      const response = await adminApiCall(`/utilisateurs/${id}`)
      return response.data || response
    },
    create: async (userData: any) => {
      const response = await adminApiCall("/utilisateurs", {
        method: "POST",
        body: JSON.stringify(userData),
      })
      return response
    },
    update: async (id: number, userData: any) => {
      const response = await adminApiCall(`/utilisateurs/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      })
      return response
    },
    delete: async (id: number) => {
      const response = await adminApiCall(`/utilisateurs/${id}`, {
        method: "DELETE",
      })
      return response
    },
    toggleStatus: async (id: number, active: boolean) => {
      const response = await adminApiCall(`/utilisateurs/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ active }),
      })
      return response
    },
  },

  // Gestion des livres
  books: {
    getAll: async () => {
      const response = await adminApiCall("/livres")
      console.log("📚 Books API Response:", response)
      
      // Le backend retourne { error: false, data: books }
      if (response.error === false && response.data) {
        return response.data
      }
      
      // Fallback si la structure est différente
      return response.data || response || []
    },
    getById: async (id: number) => {
      const response = await adminApiCall(`/livres/${id}`)
      return response.data || response
    },
    create: async (bookData: any) => {
      const response = await adminApiCall("/livres", {
        method: "POST",
        body: JSON.stringify(bookData),
      })
      return response
    },
    update: async (id: number, bookData: any) => {
      const response = await adminApiCall(`/livres/${id}`, {
        method: "PUT",
        body: JSON.stringify(bookData),
      })
      return response
    },
    delete: async (id: number) => {
      const response = await adminApiCall(`/livres/${id}`, {
        method: "DELETE",
      })
      return response
    },
  },

  // Gestion des emprunts
  borrows: {
    getAll: async () => {
      try {
        console.log('Admin API - Getting all borrows...')
        const response = await adminApiCall("/emprunts/details")
        console.log('Admin API - Borrows response:', response)
        return response.data || []
      } catch (error) {
        console.error('Admin API - Error getting borrows:', error)
        // Fallback vers l'endpoint /all si /details ne fonctionne pas
        try {
          const response = await adminApiCall("/emprunts/all")
          return response.data || []
        } catch (fallbackError) {
          console.error('Admin API - Fallback error:', fallbackError)
          return []
        }
      }
    },
    getById: async (id: number | string) => {
      const response = await adminApiCall(`/emprunts/${id}`)
      return response.data
    },
    create: async (borrowData: any) => {
      const response = await adminApiCall("/emprunts", {
        method: "POST",
        body: JSON.stringify(borrowData),
      })
      return response
    },
    returnBook: async (id: number | string, data?: any) => {
      const response = await adminApiCall(`/emprunts/${id}/return`, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      })
      return response
    },
    extend: async (id: number | string, newDate: string) => {
      const response = await adminApiCall(`/emprunts/${id}/extend`, {
        method: "PUT",
        body: JSON.stringify({ newDate }),
      })
      return response
    },
    update: async (id: number | string, borrowData: any) => {
      const response = await adminApiCall(`/emprunts/${id}`, {
        method: "PUT",
        body: JSON.stringify(borrowData),
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

  // Méthodes de compatibilité pour l'ancien format
  getBooks: async () => {
    return adminApi.books.getAll()
  },

  getBorrows: async () => {
    return adminApi.borrows.getAll()
  },

  returnBorrow: async (id: number | string, data?: any) => {
    return adminApi.borrows.returnBook(id, data)
  },

  renewBorrow: async (id: number | string, data?: any) => {
    if (data?.days) {
      // Calculer la nouvelle date basée sur le nombre de jours
      const newDate = new Date()
      newDate.setDate(newDate.getDate() + data.days)
      return adminApi.borrows.extend(id, newDate.toISOString())
    }
    return adminApi.borrows.extend(id, data?.newDate || new Date().toISOString())
  },

  createBook: async (bookData: any) => {
    return adminApi.books.create(bookData)
  },

  updateBook: async (id: string | number, bookData: any) => {
    return adminApi.books.update(typeof id === 'string' ? parseInt(id) : id, bookData)
  },

  deleteBook: async (id: string | number) => {
    return adminApi.books.delete(typeof id === 'string' ? parseInt(id) : id)
  },

  archiveBook: async (id: string | number) => {
    // Simulation d'archivage en changeant le statut
    return adminApi.books.update(typeof id === 'string' ? parseInt(id) : id, { statut: 'archive' })
  },

  unarchiveBook: async (id: string | number) => {
    // Simulation de désarchivage en changeant le statut
    return adminApi.books.update(typeof id === 'string' ? parseInt(id) : id, { statut: 'disponible' })
  },
}
