import { BookOpen, Mail, Phone, MapPin, Clock, Users, Star, Award } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 border-t shadow-2xl">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Section principale */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-300 mr-3" />
              <h2 className="text-2xl font-bold text-white">Bibliothèque Universitaire</h2>
            </div>
            <p className="text-blue-100 text-base mb-4 leading-relaxed">
              Votre portail vers la connaissance. Découvrez notre collection de plus de 50,000 ouvrages,
              des espaces d'étude modernes et des services numériques innovants.
            </p>
            <div className="flex items-center space-x-6 text-blue-200">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span className="text-sm">2,500+ étudiants</span>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                <span className="text-sm">4.8/5 satisfaction</span>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                <span className="text-sm">Prix d'excellence</span>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horaires d'ouverture
            </h3>
            <div className="space-y-2 text-blue-100">
              <div className="flex justify-between items-center">
                <span>Lundi - Vendredi</span>
                <span className="font-semibold">8h00 - 18h00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Samedi</span>
                <span className="font-semibold">9h00 - 13h00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Dimanche</span>
                <span className="font-semibold text-red-300">Fermé</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-3 text-blue-100">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-3 text-blue-300" />
                <span className="text-sm">123 Rue de l'Université<br />75000 Paris</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-blue-300" />
                <span className="text-sm">01 23 45 67 89</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-blue-300" />
                <span className="text-sm">info@biblio-uni.fr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-blue-600 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">© 2025 Bibliothèque Universitaire. Tous droits réservés.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-blue-200 hover:text-white text-sm transition-colors">
                Aide
              </a>
              <a href="/admin/connexion" className="text-blue-300 hover:text-blue-100 text-xs transition-colors opacity-70">
                Administration
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
