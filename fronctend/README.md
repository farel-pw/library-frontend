# Bibliothèque Universitaire - Frontend

Application web moderne de gestion de bibliothèque universitaire développée avec Next.js.

## 🚀 Fonctionnalités

### Pour les Étudiants
- **Authentification sécurisée** avec JWT
- **Catalogue de livres** avec recherche et filtres avancés
- **Système d'emprunt** en ligne
- **Gestion des emprunts** personnels
- **Interface responsive** et moderne

### Pour les Administrateurs
- **Tableau de bord administrateur** complet
- **Gestion des livres** (ajout, modification, suppression)
- **Gestion des étudiants** (activation/désactivation, suppression)
- **Statistiques** en temps réel

## 🛠️ Technologies Utilisées

- **Framework**: Next.js 14 avec App Router
- **UI**: shadcn/ui + Tailwind CSS
- **Authentification**: JWT avec contexte React
- **Icons**: Lucide React
- **TypeScript**: Support complet

## 📋 Prérequis

- Node.js 18+ 
- Backend API fonctionnel sur `http://localhost:4001`
- Base de données MySQL configurée

## 🚀 Installation

1. **Cloner le projet**
\`\`\`bash
git clone <votre-repo>
cd bibliotheque-frontend
\`\`\`

2. **Installer les dépendances**
\`\`\`bash
npm install
\`\`\`

3. **Configurer l'environnement**
Assurez-vous que votre backend est démarré sur le port 4001.

4. **Lancer l'application**
\`\`\`bash
npm run dev
\`\`\`

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

\`\`\`
├── app/                          # Pages Next.js (App Router)
│   ├── page.tsx                 # Page d'accueil
│   ├── inscription/             # Page d'inscription
│   ├── connexion/               # Page de connexion
│   └── dashboard/               # Pages du tableau de bord
│       ├── livres/              # Catalogue des livres
│       ├── emprunts/            # Gestion des emprunts
│       └── admin/               # Interface administrateur
├── components/                   # Composants réutilisables
│   ├── ui/                      # Composants shadcn/ui
│   ├── navbar.tsx               # Barre de navigation
│   └── footer.tsx               # Pied de page
├── lib/                         # Utilitaires et configuration
│   ├── auth-context.tsx         # Contexte d'authentification
│   └── api.ts                   # Appels API
└── public/                      # Assets statiques
\`\`\`

## 🔗 API Endpoints Utilisés

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion

### Livres (Étudiants)
- `GET /livres` - Liste des livres avec filtres
- `POST /emprunts` - Emprunter un livre
- `POST /retours` - Retourner un livre
- `GET /emprunts` - Mes emprunts

### Administration
- `GET /admin/livres` - Gestion des livres
- `POST /admin/livres` - Ajouter un livre
- `PUT /admin/livres/:id` - Modifier un livre
- `DELETE /admin/livres/:id` - Supprimer un livre
- `GET /admin/etudiants` - Gestion des étudiants
- `PUT /admin/etudiants/:id` - Modifier un étudiant
- `DELETE /admin/etudiants/:id` - Supprimer un étudiant

## 👥 Rôles et Permissions

### Étudiant
- Consulter le catalogue
- Emprunter/retourner des livres
- Voir ses emprunts personnels

### Administrateur
- Toutes les permissions étudiant
- Gérer les livres (CRUD)
- Gérer les étudiants
- Accès aux statistiques

## 🎨 Interface Utilisateur

### Page d'Accueil
- Message de bienvenue inspirant
- Formulaires d'authentification intégrés
- Image de fond de bibliothèque
- Statistiques de la bibliothèque

### Catalogue des Livres
- Affichage en grille responsive
- Filtres par titre, auteur, genre
- Recherche en temps réel
- Cartes de livres avec informations complètes

### Gestion des Emprunts
- Liste des emprunts avec statuts
- Indicateurs de retard
- Statistiques personnelles
- Actions de retour simplifiées

### Interface Administrateur
- Tableau de bord avec statistiques
- Gestion des livres avec formulaires modaux
- Gestion des étudiants avec activation/désactivation
- Interface intuitive et sécurisée

## 🔒 Sécurité

- **Authentification JWT** stockée localement
- **Protection des routes** avec middleware
- **Vérification des rôles** côté client et serveur
- **Validation des formulaires** avant envoi

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

## 🚀 Déploiement

### Développement
\`\`\`bash
npm run dev
\`\`\`

### Production
\`\`\`bash
npm run build
npm start
\`\`\`

### Déploiement Vercel
\`\`\`bash
vercel --prod
\`\`\`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**Développé avec ❤️ pour moderniser la gestion des bibliothèques universitaires**
