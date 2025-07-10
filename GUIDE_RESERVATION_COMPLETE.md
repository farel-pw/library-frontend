# 📋 GUIDE COMPLET : COMMENT MARCHE LE SYSTÈME DE RÉSERVATION

## 🎯 Vue d'ensemble

Le système de réservation permet aux utilisateurs de **"réserver leur place dans la file"** quand tous les exemplaires d'un livre sont empruntés.

## 🔄 Scénarios d'utilisation

### 📚 **Scénario 1 : Livre Disponible**
```
📖 "Le Petit Prince" 
🟢 Exemplaires: 2/3 disponibles
👤 Action utilisateur: Clique sur "Emprunter (2 dispo)"
✅ Résultat: Emprunt immédiat
```

### 📚 **Scénario 2 : Livre Complet → Réservation**
```
📖 "The Great Gatsby"
🔴 Exemplaires: 0/3 disponibles (tous empruntés)
👤 Action utilisateur: Clique sur "Réserver"
✅ Résultat: Réservation créée, position dans la file
```

## 🏗️ Architecture du Système

### 1. **Frontend (Interface Utilisateur)**
```typescript
// Dans fronctend/app/dashboard/livres/page.tsx

const getBookActionButton = (livre: Livre) => {
  const available = livre.exemplaires_disponibles || 0
  
  if (available > 0) {
    return {
      type: 'borrow',
      text: `Emprunter (${available} dispo)`,
      variant: 'default',
      className: 'w-full bg-green-600 hover:bg-green-700'
    }
  } else {
    return {
      type: 'reserve',
      text: 'Réserver',
      variant: 'outline', 
      className: 'w-full border-blue-600 text-blue-600 hover:bg-blue-50'
    }
  }
}
```

### 2. **Backend (Logique Métier)**
```javascript
// Dans src/services/ReservationService.js

static async createReservationFromUnavailableBook(reservationData) {
  // 1. Vérifier que l'utilisateur n'a pas déjà une réservation
  // 2. Vérifier que l'utilisateur n'a pas déjà emprunté ce livre
  // 3. Créer la réservation avec statut 'active'
  // 4. Calculer la position dans la file d'attente
  // 5. Retourner la position à l'utilisateur
}
```

### 3. **Base de Données**
```sql
-- Table des réservations
CREATE TABLE reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  date_reservation DATETIME NOT NULL,
  statut ENUM('active', 'expirée', 'validée') DEFAULT 'active',
  priorite ENUM('normale', 'urgente') DEFAULT 'normale'
);
```

## 📊 États et Transitions

### 🔄 **Cycle de vie d'une réservation**

```
1. CRÉATION
   📋 Utilisateur clique "Réserver"
   ↓
   🔍 Vérifications:
   - Livre indisponible ? ✅
   - Pas déjà réservé ? ✅
   - Pas déjà emprunté ? ✅
   ↓
   ✅ Réservation créée avec statut 'active'

2. FILE D'ATTENTE
   📍 Position calculée par date de création
   👥 Autres utilisateurs peuvent voir le nombre de réservations
   ⏳ Attente qu'un exemplaire se libère

3. NOTIFICATION (quand livre disponible)
   📱 Premier de la file est notifié
   ⏰ Il a 24h pour emprunter
   ↓
   🎯 DEUX OPTIONS:
   A) Il emprunte → Statut 'validée'
   B) Il n'emprunte pas → Statut 'expirée', suivant notifié
```

## 🔧 Flux Techniques Détaillés

### **Étape 1 : Détection d'un livre complet**
```javascript
// Le calcul se fait en temps réel
SELECT 
  l.id,
  3 as exemplaires_total,
  COUNT(e.id) as emprunts_actifs,
  GREATEST(0, 3 - COUNT(e.id)) as exemplaires_disponibles
FROM livres l
LEFT JOIN emprunts e ON l.id = e.livre_id AND e.date_retour_effective IS NULL
WHERE l.id = ?

// Si exemplaires_disponibles = 0 → Bouton "Réserver"
```

### **Étape 2 : Création de la réservation**
```javascript
// Route: POST /emprunts/reserver
{
  livre_id: 5,
  utilisateur_id: 3 // Pris du token JWT
}

// Validation:
1. Livre existe ?
2. Utilisateur n'a pas déjà réservé ce livre ?
3. Utilisateur n'a pas déjà emprunté ce livre ?

// Si OK:
INSERT INTO reservations (utilisateur_id, livre_id, date_reservation, statut)
VALUES (3, 5, NOW(), 'active')
```

### **Étape 3 : Calcul de la position**
```javascript
// Position = nombre de réservations antérieures + 1
SELECT COUNT(*) + 1 as position
FROM reservations 
WHERE livre_id = 5 
AND date_reservation < (SELECT date_reservation FROM reservations WHERE id = ?)
AND statut = 'active'
```

### **Étape 4 : Quand un livre est retourné**
```javascript
// Dans BorrowService.returnBook()
1. Marquer l'emprunt comme retourné
2. Appeler ReservationService.promoteNextInQueue(livre_id)
3. Envoyer notification au premier de la file
4. Mettre à jour l'interface utilisateur
```

## 🎨 Interface Utilisateur

### **Vue Liste des Livres**
```
┌─────────────────────────────────────┐
│ 📖 The Great Gatsby                │
│ 👤 F. Scott Fitzgerald             │
│ 🔴 Tous empruntés (0/3)            │
│ 📋 2 réservation(s) en attente     │
│ ┌─────────────────────────────────┐ │
│ │        🔵 RÉSERVER              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **Vue Mes Réservations**
```
┌─────────────────────────────────────┐
│ 📋 MES RÉSERVATIONS                 │
├─────────────────────────────────────┤
│ 📖 The Great Gatsby                │
│ 📅 Réservé le: 10/07/2025          │
│ 📍 Position: 1/2 dans la file      │
│ 🟡 Statut: En attente              │
│ ┌─────────────────────────────────┐ │
│ │      ❌ ANNULER                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔔 Système de Notifications

### **Types de notifications**
1. **Réservation créée** : "Votre réservation pour 'Titre' a été créée. Position: 2/3"
2. **Position mise à jour** : "Vous êtes maintenant 1er dans la file pour 'Titre'"
3. **Livre disponible** : "Le livre 'Titre' est maintenant disponible ! Vous avez 24h pour l'emprunter"
4. **Réservation expirée** : "Votre réservation pour 'Titre' a expiré"

## 📊 Avantages du Système

### ✅ **Pour les Utilisateurs**
- **Équitable** : Premier arrivé, premier servi
- **Transparent** : Position visible en temps réel
- **Pratique** : Pas besoin de revenir constamment vérifier
- **Notifications** : Alerté quand le livre est disponible

### ✅ **Pour les Administrateurs**
- **Automatique** : Gestion de file sans intervention
- **Statistiques** : Vue sur la demande réelle
- **Réduction des conflits** : Système équitable
- **Optimisation** : Peut identifier les livres populaires

## 🛠️ Configuration et Maintenance

### **Variables importantes**
```javascript
// Délai d'expiration d'une réservation (en heures)
const RESERVATION_EXPIRY_HOURS = 24;

// Nombre maximum de réservations par utilisateur
const MAX_RESERVATIONS_PER_USER = 5;

// Priorités possibles
const PRIORITIES = ['normale', 'urgente'];
```

### **Maintenance régulière**
```sql
-- Nettoyer les réservations expirées
DELETE FROM reservations 
WHERE statut = 'expiree' 
AND date_reservation < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Statistiques d'utilisation
SELECT 
  l.titre,
  COUNT(r.id) as total_reservations,
  AVG(TIMESTAMPDIFF(HOUR, r.date_reservation, r.date_validation)) as temps_attente_moyen
FROM livres l
JOIN reservations r ON l.id = r.livre_id
WHERE r.statut = 'validee'
GROUP BY l.id
ORDER BY total_reservations DESC;
```

## 🎯 Intégration Complète

Le système de réservation s'intègre parfaitement avec :

1. **Système d'emprunts** : Vérification automatique des disponibilités
2. **Gestion des utilisateurs** : Authentification et permissions
3. **Notifications** : Alertes automatiques
4. **Interface admin** : Gestion et statistiques
5. **Analytics** : Données sur la popularité des livres

## 🎉 Résultat Final

**Le système de réservation transforme l'expérience utilisateur** :
- ❌ **Avant** : "Désolé, plus d'exemplaires disponibles, revenez plus tard"
- ✅ **Maintenant** : "Réservez votre place ! Vous êtes 2ème dans la file, estimé disponible dans 7 jours"

C'est un système **complet, automatique et équitable** qui améliore considérablement l'expérience de la bibliothèque ! 🎉
