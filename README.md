# 📚 Système de Gestion de Bibliothèque

Un système complet de gestion de bibliothèque développé avec Node.js, Express, MySQL et Next.js.

## 🌟 Fonctionnalités

### 👥 Gestion des Utilisateurs
- **Inscription et authentification** des étudiants et administrateurs
- **Profils utilisateurs** avec historique d'emprunts
- **Gestion des rôles** (étudiant/admin)
- **Activation/désactivation** des comptes

### 📖 Gestion des Livres
- **Catalogue complet** avec recherche avancée
- **Gestion CRUD** des livres (ajout, modification, suppression)
- **Suivi de disponibilité** en temps réel
- **Métadonnées complètes** (titre, auteur, genre, ISBN, etc.)

### 📅 Système d'Emprunts
- **Emprunts et retours** automatisés
- **Gestion des dates d'échéance** et prolongations
- **Calcul automatique des pénalités** de retard
- **Notifications de rappel** par email

### 🔖 Système de Réservations
- **Réservation de livres** indisponibles
- **File d'attente automatique**
- **Notifications** quand un livre devient disponible
- **Gestion des expirations** de réservations

### 💬 Système de Commentaires
- **Évaluation et avis** sur les livres
- **Modération** des commentaires
- **Système de notation** (1-5 étoiles)
- **Affichage des notes moyennes**

### 📊 Analytics et Rapports
- **Tableau de bord administrateur** avec métriques en temps réel
- **Statistiques d'utilisation** détaillées
- **Rapports d'activité** exportables
- **Analyses de tendances** et patterns d'usage

### 🔔 Système de Notifications
- **Notifications automatiques** par email
- **Rappels d'échéance** programmés
- **Alertes de retard** et pénalités
- **Notifications de réservations** disponibles

## 🏗️ Architecture Technique

### Backend (Node.js + Express)
```
Backend 2/
├── src/
│   ├── server.js              # Point d'entrée du serveur
│   ├── config/               # Configuration (DB, JWT, etc.)
│   ├── controllers/          # Logique de contrôle des routes
│   │   ├── AuthController.js
│   │   ├── BookController.js
│   │   ├── UserController.js
│   │   ├── BorrowController.js
│   │   ├── ReservationController.js
│   │   ├── CommentController.js
│   │   ├── AnalyticsController.js
│   │   └── NotificationController.js
│   ├── models/               # Modèles de données et requêtes SQL
│   ├── routes/               # Définition des routes API
│   ├── services/             # Logique métier
│   ├── middleware/           # Middlewares (auth, errors, etc.)
│   └── utils/                # Utilitaires (logger, helpers)
├── database/
│   ├── migrations/           # Scripts de migration de DB
│   └── seeders/              # Données de test
└── scripts/                  # Scripts d'administration
```

### Frontend (Next.js + TypeScript)
```
fronctend/
├── app/
│   ├── page.tsx              # Page d'accueil
│   ├── layout.tsx            # Layout principal
│   ├── admin/                # Interface d'administration
│   │   ├── dashboard/        # Tableau de bord admin
│   │   ├── users/            # Gestion des utilisateurs
│   │   ├── books/            # Gestion des livres
│   │   └── reports/          # Rapports et analytics
│   ├── dashboard/            # Tableau de bord étudiant
│   ├── connexion/            # Page de connexion
│   └── inscription/          # Page d'inscription
├── components/
│   ├── ui/                   # Composants UI réutilisables
│   └── admin/                # Composants spécifiques admin
├── lib/
│   ├── api.ts                # Client API principal
│   ├── admin-api.ts          # Client API admin
│   └── auth-context.tsx      # Contexte d'authentification
└── types/                    # Définitions TypeScript
```

### Base de Données (MySQL)
```sql
-- Tables principales
├── utilisateurs              # Comptes utilisateurs
├── livres                    # Catalogue des livres
├── emprunts                  # Historique des emprunts
├── reservations              # File d'attente des réservations
├── commentaires              # Avis et notes sur les livres
└── notifications             # Système de notifications
```

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** (v18 ou supérieur)
- **MySQL** (v8.0 ou supérieur)
- **npm** ou **pnpm**

### 1. Configuration de la Base de Données

1. **Créer la base de données MySQL :**
```sql
CREATE DATABASE bibliotheque;
```

2. **Configurer les variables d'environnement Backend :**
```bash
cd "Backend 2"
cp .env.example .env
```

Éditer `.env` :
```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=bibliotheque
DB_PORT=3306

# Configuration du serveur
PORT=4401

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise

# Environnement
NODE_ENV=development
```

3. **Installer les dépendances et initialiser la DB :**
```bash
npm install
node scripts/migrate-seed.js
```

### 2. Configuration du Backend

1. **Démarrer le serveur de développement :**
```bash
npm run dev
# ou
node src/server.js
```

Le serveur sera accessible sur `http://localhost:4401`

### 3. Configuration du Frontend

1. **Installer les dépendances :**
```bash
cd ../fronctend
npm install
# ou
pnpm install
```

2. **Configurer l'API :**
Vérifier le fichier `lib/api-config.ts` :
```typescript
export const API_BASE_URL = 'http://localhost:4401'
```

3. **Démarrer l'application :**
```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

## 👤 Comptes par Défaut

Après l'installation, vous pouvez utiliser ces comptes de test :

### Administrateur
- **Email :** `admin@bibliotheque.fr`
- **Mot de passe :** `admin123`
- **Accès :** Interface d'administration complète

### Étudiant
- **Email :** `jean.dupont@email.fr`
- **Mot de passe :** `password123`
- **Accès :** Interface utilisateur standard

## 📖 Guide d'Utilisation

### Interface Administrateur

1. **Tableau de Bord :** Vue d'ensemble des statistiques
2. **Gestion des Utilisateurs :** CRUD complet des comptes
3. **Gestion des Livres :** Catalogue et disponibilité
4. **Emprunts en Cours :** Suivi et gestion des emprunts
5. **Réservations :** Validation et gestion de la file d'attente
6. **Commentaires :** Modération des avis utilisateurs
7. **Rapports :** Analytics et exportation de données

### Interface Utilisateur

1. **Catalogue :** Recherche et navigation dans les livres
2. **Mon Compte :** Profil et historique d'emprunts
3. **Mes Emprunts :** Suivi des livres empruntés
4. **Mes Réservations :** Gestion des réservations
5. **Favoris :** Liste de livres favoris

## 🔧 Scripts Utiles

### Backend
```bash
# Redémarrer la base de données (supprime toutes les données)
node scripts/fresh.js

# Exécuter seulement les migrations
node scripts/migrate.js

# Ajouter les données de test
node scripts/seed.js

# Vérifier la connexion DB
node test-db-connection.js

# Vérifier les emprunts en retard
node scripts/check-overdue.js
```

### Frontend
```bash
# Démarrage en mode développement
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start

# Linting du code
npm run lint
```

## 📊 API Endpoints

### Authentification
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/register` - Inscription utilisateur
- `POST /auth/logout` - Déconnexion

### Livres
- `GET /livres` - Liste des livres
- `GET /livres/:id` - Détails d'un livre
- `POST /livres` - Créer un livre (admin)
- `PUT /livres/:id` - Modifier un livre (admin)
- `DELETE /livres/:id` - Supprimer un livre (admin)

### Emprunts
- `GET /emprunts` - Liste des emprunts
- `POST /emprunts` - Créer un emprunt
- `PUT /emprunts/:id/retour` - Retourner un livre
- `PUT /emprunts/:id/prolonger` - Prolonger un emprunt

### Réservations
- `GET /reservations` - Liste des réservations
- `POST /reservations` - Créer une réservation
- `PUT /reservations/:id/valider` - Valider une réservation (admin)
- `DELETE /reservations/:id` - Annuler une réservation

### Analytics (Admin)
- `GET /analytics/dashboard` - Statistiques du tableau de bord
- `GET /analytics/books` - Analytics des livres
- `GET /analytics/users` - Analytics des utilisateurs

## 🔒 Sécurité

### Authentification
- **JWT Tokens** pour l'authentification stateless
- **Hashage des mots de passe** avec bcrypt
- **Validation des tokens** sur toutes les routes protégées

### Autorisation
- **Contrôle d'accès basé sur les rôles** (RBAC)
- **Middleware d'autorisation** pour les routes admin
- **Validation des permissions** côté client et serveur

### Validation des Données
- **Validation côté serveur** de toutes les entrées
- **Sanitisation des données** pour prévenir les injections
- **Validation TypeScript** côté frontend

## 🐛 Dépannage

### Problèmes de Base de Données
```bash
# Vérifier la connexion
node test-db-connection.js

# Réinitialiser la base de données
node scripts/fresh.js

# Vérifier les migrations
node scripts/migrate.js
```

### Problèmes d'API
```bash
# Vérifier que le serveur est démarré
curl http://localhost:4401/health

# Tester une route spécifique
curl http://localhost:4401/analytics/dashboard
```

### Problèmes Frontend
```bash
# Vérifier les erreurs de compilation
npm run build

# Vérifier les erreurs de linting
npm run lint

# Nettoyer le cache Next.js
rm -rf .next
```

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche pour votre fonctionnalité
3. **Commiter** vos changements
4. **Pusher** vers la branche
5. **Ouvrir** une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- **Email :** support@bibliotheque.fr
- **Issues :** Ouvrir un ticket sur GitHub
- **Documentation :** Consulter le wiki du projet

---

**Développé avec ❤️ pour la gestion moderne de bibliothèques**
