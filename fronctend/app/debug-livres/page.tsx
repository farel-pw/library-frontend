"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

interface Livre {
  id: number
  titre: string
  auteur: string
  genre: string
  disponible: boolean
}

export default function DebugLivresPage() {
  const [livres, setLivres] = useState<Livre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  useEffect(() => {
    loadLivres()
  }, [])

  const loadLivres = async () => {
    try {
      setLoading(true)
      addDebugInfo("🔍 Début du chargement des livres...")
      
      // Test de l'API
      addDebugInfo("📞 Appel de api.getLivres()...")
      const data = await api.getLivres()
      addDebugInfo(`📊 Données reçues: ${JSON.stringify(data).substring(0, 200)}...`)
      
      const livresArray = Array.isArray(data) ? data : []
      addDebugInfo(`📚 Livres array: ${livresArray.length} livres`)
      
      if (livresArray.length === 0) {
        addDebugInfo("⚠️ Aucun livre dans le tableau")
      } else {
        addDebugInfo(`✅ Premier livre: ${livresArray[0].titre}`)
      }
      
      setLivres(livresArray)
      addDebugInfo(`📋 État mis à jour avec ${livresArray.length} livres`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      addDebugInfo(`❌ Erreur: ${errorMessage}`)
      setError(errorMessage)
      setLivres([])
    } finally {
      setLoading(false)
      addDebugInfo("🏁 Chargement terminé")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Debug - Chargement des livres...</h1>
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Informations de debug:</h2>
          {debugInfo.map((info, index) => (
            <div key={index} className="text-sm font-mono">{info}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug - Livres ({livres.length})</h1>
      
      {/* Informations de debug */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">Informations de debug:</h2>
        {debugInfo.map((info, index) => (
          <div key={index} className="text-sm font-mono">{info}</div>
        ))}
      </div>

      {/* Bouton de rechargement */}
      <button 
        onClick={loadLivres}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Recharger les livres
      </button>

      {/* Affichage des erreurs */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* État des données */}
      <div className="bg-blue-100 p-4 rounded mb-6">
        <h2 className="font-semibold mb-2">État des données:</h2>
        <div>Loading: {loading.toString()}</div>
        <div>Livres.length: {livres.length}</div>
        <div>Type de livres: {Array.isArray(livres) ? 'Array' : typeof livres}</div>
      </div>

      {/* Liste des livres */}
      {livres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {livres.map((livre) => (
            <div key={livre.id} className="border rounded p-4 bg-white shadow">
              <h3 className="font-semibold text-lg mb-2">{livre.titre}</h3>
              <p className="text-gray-600 mb-1">Par: {livre.auteur}</p>
              <p className="text-gray-600 mb-1">Genre: {livre.genre}</p>
              <p className="text-gray-600 mb-1">ID: {livre.id}</p>
              <p className="text-gray-600">
                Disponible: {livre.disponible ? 'Oui' : 'Non'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun livre trouvé
          </h3>
          <p className="text-gray-600">
            Vérifiez les informations de debug ci-dessus
          </p>
        </div>
      )}
    </div>
  )
}
