"use client"

import { useState, useEffect } from "react"

export default function LivresSimplePage() {
  const [livres, setLivres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch('http://localhost:4401/livres')
      .then(response => response.json())
      .then(data => {
        console.log('Données reçues:', data)
        if (data.error) {
          setError(data.message)
        } else {
          setLivres(data.data || [])
        }
      })
      .catch(err => {
        console.error('Erreur:', err)
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8">Chargement des livres...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erreur: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Livres ({livres.length})</h1>
      
      {livres.length === 0 ? (
        <div className="text-gray-500">Aucun livre trouvé</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {livres.map((livre: any) => (
            <div key={livre.id} className="border rounded p-4 shadow">
              <h3 className="font-semibold">{livre.titre}</h3>
              <p className="text-gray-600">Par: {livre.auteur}</p>
              <p className="text-gray-600">Genre: {livre.genre}</p>
              <p className="text-sm text-gray-500">
                {livre.disponible ? '✅ Disponible' : '❌ Indisponible'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
