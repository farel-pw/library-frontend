# 📡 Documentation API - Système de Gestion de Bibliothèque

## 🌐 Base URL
```
http://localhost:4401
```

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## 📚 Endpoints API

### 🔑 Authentification

#### POST `/auth/login`
Connecte un utilisateur au système.

**Body :**
```json
{
  "email": "utilisateur@email.com",
  "mot_de_passe": "motdepasse"
}
```

**Réponse (200) :**
```json
{
  "error": false,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@email.fr",
      "role": "etudiant"
    }
  }
}
```

#### POST `/auth/register`
Inscrit un nouvel utilisateur.

**Body :**
```json
{
  "nom": "Martin",
  "prenom": "Marie",
  "email": "marie.martin@email.fr",
  "mot_de_passe": "motdepasse123"
}
```

### 📖 Livres

#### GET `/livres`
Récupère la liste des livres avec pagination et filtres.

**Query Parameters :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre de livres par page (défaut: 10)
- `search` (optionnel) : Recherche par titre ou auteur
- `genre` (optionnel) : Filtrer par genre
- `disponible` (optionnel) : Filtrer par disponibilité (true/false)

**Réponse (200) :**
```json
{
  "error": false,
  "data": {
    "livres": [
      {
        "id": 1,
        "titre": "Le Petit Prince",
        "auteur": "Antoine de Saint-Exupéry",
        "genre": "Fiction",
        "isbn": "9782070408504",
        "annee_publication": 1943,
        "disponible": true,
        "date_ajout": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

#### GET `/livres/:id`
Récupère les détails d'un livre spécifique.

**Réponse (200) :**
```json
{
  "error": false,
  "data": {
    "id": 1,
    "titre": "Le Petit Prince",
    "auteur": "Antoine de Saint-Exupéry",
    "genre": "Fiction",
    "isbn": "9782070408504",
    "annee_publication": 1943,
    "disponible": true,
    "date_ajout": "2025-01-01T00:00:00.000Z",
    "commentaires": [
      {
        "id": 1,
        "utilisateur_nom": "Jean Dupont",
        "note": 5,
        "commentaire": "Un chef-d'œuvre intemporel !",
        "date_creation": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### POST `/livres` 🔒 Admin
Ajoute un nouveau livre au catalogue.

**Body :**
```json
{
  "titre": "1984",
  "auteur": "George Orwell",
  "genre": "Dystopie",
  "isbn": "9782070368228",
  "annee_publication": 1949
}
```

### 📅 Emprunts

#### GET `/emprunts` 🔒
Récupère les emprunts de l'utilisateur connecté.

**Réponse (200) :**
```json
{
  "error": false,
  "data": [
    {
      "id": 1,
      "livre_id": 1,
      "livre_titre": "Le Petit Prince",
      "livre_auteur": "Antoine de Saint-Exupéry",
      "date_emprunt": "2025-01-01",
      "date_retour_prevue": "2025-01-15",
      "date_retour_effective": null,
      "rendu": false,
      "penalites": 0.00,
      "jours_restants": 5
    }
  ]
}
```

#### POST `/emprunts` 🔒
Effectue un nouvel emprunt.

**Body :**
```json
{
  "livre_id": 1
}
```

#### PUT `/emprunts/:id/retour` 🔒
Retourne un livre emprunté.

**Réponse (200) :**
```json
{
  "error": false,
  "message": "Livre retourné avec succès",
  "data": {
    "penalites": 2.50,
    "jours_retard": 5
  }
}
```

### 🔖 Réservations

#### GET `/reservations` 🔒
Récupère les réservations de l'utilisateur.

**Réponse (200) :**
```json
{
  "error": false,
  "data": [
    {
      "id": 1,
      "livre_id": 1,
      "livre_titre": "Le Petit Prince",
      "livre_auteur": "Antoine de Saint-Exupéry",
      "date_reservation": "2025-01-01T10:00:00.000Z",
      "statut": "en_attente",
      "position_file": 2
    }
  ]
}
```

#### POST `/reservations` 🔒
Effectue une nouvelle réservation.

**Body :**
```json
{
  "livre_id": 1
}
```

### 💬 Commentaires

#### GET `/commentaires/livre/:livre_id`
Récupère les commentaires d'un livre.

**Réponse (200) :**
```json
{
  "error": false,
  "data": [
    {
      "id": 1,
      "utilisateur_nom": "Jean Dupont",
      "note": 5,
      "commentaire": "Excellent livre !",
      "date_creation": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST `/commentaires` 🔒
Ajoute un commentaire sur un livre.

**Body :**
```json
{
  "livre_id": 1,
  "note": 5,
  "commentaire": "Un livre extraordinaire !"
}
```

### 📊 Analytics (Admin uniquement)

#### GET `/analytics/dashboard` 🔒 Admin
Récupère les statistiques principales du tableau de bord.

**Réponse (200) :**
```json
{
  "error": false,
  "data": {
    "total_livres": 2500,
    "livres_disponibles": 2350,
    "total_utilisateurs": 150,
    "utilisateurs_actifs": 142,
    "total_emprunts": 450,
    "emprunts_actifs": 120,
    "emprunts_en_retard": 15,
    "total_reservations": 80,
    "reservations_en_attente": 25,
    "total_commentaires": 300,
    "note_moyenne_generale": 4.2
  }
}
```

#### GET `/analytics/books` 🔒 Admin
Récupère les analytics des livres.

**Query Parameters :**
- `period` (optionnel) : Période en jours (défaut: 30)

#### GET `/analytics/users` 🔒 Admin
Récupère les analytics des utilisateurs.

### 👥 Gestion des Utilisateurs (Admin)

#### GET `/utilisateurs` 🔒 Admin
Récupère la liste de tous les utilisateurs.

#### PUT `/utilisateurs/:id/toggle-active` 🔒 Admin
Active/désactive un utilisateur.

#### DELETE `/utilisateurs/:id` 🔒 Admin
Supprime un utilisateur (soft delete).

### 🔔 Notifications

#### GET `/notifications` 🔒
Récupère les notifications de l'utilisateur connecté.

#### PUT `/notifications/:id/read` 🔒
Marque une notification comme lue.

#### GET `/notifications/stats` 🔒 Admin
Récupère les statistiques des notifications.

## 📋 Codes de Statut HTTP

| Code | Description |
|------|-------------|
| 200  | Succès |
| 201  | Créé avec succès |
| 400  | Erreur de validation des données |
| 401  | Non authentifié |
| 403  | Accès interdit (permissions insuffisantes) |
| 404  | Ressource non trouvée |
| 409  | Conflit (ex: livre déjà emprunté) |
| 500  | Erreur interne du serveur |

## 🔍 Formats de Réponse

### Réponse de Succès
```json
{
  "error": false,
  "message": "Opération réussie",
  "data": { /* données */ }
}
```

### Réponse d'Erreur
```json
{
  "error": true,
  "message": "Description de l'erreur",
  "code": "CODE_ERREUR",
  "details": { /* détails optionnels */ }
}
```

## 🛡️ Sécurité

### Authentification JWT
- Les tokens expirent après 24 heures
- Refresh automatique côté client
- Logout côté serveur pour invalidation

### Validation des Données
- Validation côté serveur obligatoire
- Sanitisation des entrées utilisateur
- Protection contre les injections SQL

### Autorisations
- Rôles : `etudiant`, `admin`
- Middleware de vérification des permissions
- Accès restreint aux endpoints sensibles

## 📝 Exemples d'Utilisation

### Connexion et Navigation
```javascript
// 1. Connexion
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jean.dupont@email.fr',
    mot_de_passe: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// 2. Récupération des livres
const booksResponse = await fetch('/livres?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 3. Emprunt d'un livre
const borrowResponse = await fetch('/emprunts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ livre_id: 1 })
});
```

### Gestion Admin
```javascript
// Récupération des statistiques admin
const statsResponse = await fetch('/analytics/dashboard', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});

// Ajout d'un nouveau livre
const newBookResponse = await fetch('/livres', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    titre: '1984',
    auteur: 'George Orwell',
    genre: 'Dystopie',
    isbn: '9782070368228'
  })
});
```
