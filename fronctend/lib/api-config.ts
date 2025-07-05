// Configuration de l'API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4401',
  ENDPOINTS: {
    LOGIN: '/userlogin',
    REGISTER: '/signup',
    PROFILE: '/profile',
    BOOKS: '/livres',
    BORROWS: '/emprunts',
    RESERVATIONS: '/reservations',
    COMMENTS: '/commentaires'
  }
}

// Helper pour construire les URLs complètes
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
