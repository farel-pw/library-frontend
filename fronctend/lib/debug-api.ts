// Fichier de debug pour tester les API
import { api } from './api'

export const testAPIs = async (userId?: number) => {
  console.log('🧪 Début des tests API...')
  
  try {
    // Test des emprunts
    console.log('📚 Test API emprunts...')
    const emprunts = await api.getUserEmprunts()
    console.log('📚 Emprunts résultat:', emprunts)
    console.log('📚 Type emprunts:', typeof emprunts, Array.isArray(emprunts))
    
    // Test des réservations
    console.log('📋 Test API réservations...')
    const reservations = await api.getUserReservations()
    console.log('📋 Réservations résultat:', reservations)
    console.log('📋 Type réservations:', typeof reservations, Array.isArray(reservations))
    
    // Test des commentaires
    console.log('💬 Test API commentaires...')
    const commentaires = await api.getUserCommentaires()
    console.log('💬 Commentaires résultat:', commentaires)
    console.log('💬 Type commentaires:', typeof commentaires, Array.isArray(commentaires))
    
    // Test des livres
    console.log('📖 Test API livres...')
    const livres = await api.getLivres()
    console.log('📖 Livres résultat:', livres)
    console.log('📖 Type livres:', typeof livres, Array.isArray(livres))
    
    console.log('✅ Tests API terminés')
    
    return {
      emprunts,
      reservations,
      commentaires,
      livres
    }
  } catch (error) {
    console.error('❌ Erreur lors des tests API:', error)
    throw error
  }
}

// Fonction pour tester un livre spécifique
export const testCommentairesLivre = async (livreId: number) => {
  console.log('🧪 Test commentaires pour livre:', livreId)
  
  try {
    const commentaires = await api.getCommentaires(livreId)
    console.log('💬 Commentaires livre', livreId, ':', commentaires)
    console.log('💬 Type:', typeof commentaires, Array.isArray(commentaires))
    return commentaires
  } catch (error) {
    console.error('❌ Erreur test commentaires livre:', error)
    throw error
  }
}
