export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 border-t shadow-lg">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Bibliothèque Universitaire</h2>
          <p className="text-white/90 text-base mb-2">Système de gestion moderne pour votre université</p>
          <div className="mt-4 inline-block bg-white/10 rounded-lg px-6 py-4">
            <span className="font-semibold text-white text-lg block mb-2">Horaires d'ouverture</span>
            <ul className="text-white/90 text-base space-y-1">
              <li>Lundi - Vendredi : <span className="font-semibold">8h00 - 18h00</span></li>
              <li>Samedi : <span className="font-semibold">9h00 - 13h00</span></li>
              <li>Dimanche : <span className="font-semibold text-red-200">Fermé</span></li>
            </ul>
          </div>
          <p className="text-white/80 text-xs mt-6">© 2024 Bibliothèque Universitaire. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
