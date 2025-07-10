# 📚 Documentation - Système de Gestion des Exemplaires

## 🎯 Vue d'ensemble

Le système de gestion des exemplaires permet de gérer **3 exemplaires par livre**, offrant une gestion dynamique des emprunts avec mise à jour automatique de la disponibilité en temps réel.

## 🏗️ Architecture du Système

### Structure Base de Données

#### Table `livres` - Nouvelles colonnes
```sql
ALTER TABLE livres 
ADD COLUMN exemplaires_total INT DEFAULT 3,
ADD COLUMN exemplaires_disponibles INT DEFAULT 3;
```

#### Calcul Dynamique de Disponibilité
```sql
SELECT 
  l.id,
  l.titre,
  l.exemplaires_total,
  COUNT(e.id) as emprunts_actifs,
  GREATEST(0, l.exemplaires_total - COUNT(e.id)) as exemplaires_disponibles
FROM livres l
LEFT JOIN emprunts e ON l.id = e.livre_id AND e.date_retour_effective IS NULL
WHERE l.id = ?
GROUP BY l.id
```

## 🔧 Composants Backend

### 1. BorrowService.js - Modifications principales

#### Vérification avant emprunt
```javascript
static async createBorrow(borrowData) {
  // 1. Vérifier la disponibilité (max 3 exemplaires)
  const availabilityCheck = await new Promise((resolve, reject) => {
    const query = `
      SELECT 
        l.id,
        l.titre,
        3 as exemplaires_total,
        COUNT(e.id) as emprunts_actifs,
        GREATEST(0, 3 - COUNT(e.id)) as exemplaires_disponibles
      FROM livres l
      LEFT JOIN emprunts e ON l.id = e.livre_id AND e.date_retour_effective IS NULL
      WHERE l.id = ?
      GROUP BY l.id
    `;
    
    connection.query(query, [borrowData.livre_id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0]);
    });
  });

  // 2. Vérifier si exemplaires disponibles
  if (availabilityCheck.exemplaires_disponibles <= 0) {
    return { 
      error: true, 
      message: "Tous les exemplaires de ce livre sont déjà empruntés. Veuillez réessayer plus tard." 
    };
  }

  // 3. Vérifier si l'utilisateur n'a pas déjà emprunté ce livre
  const userBorrowCheck = await new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count 
      FROM emprunts 
      WHERE utilisateur_id = ? AND livre_id = ? AND date_retour_effective IS NULL
    `;
    
    connection.query(query, [borrowData.utilisateur_id, borrowData.livre_id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0].count > 0);
    });
  });

  if (userBorrowCheck) {
    return { error: true, message: "Vous avez déjà emprunté ce livre" };
  }

  // 4. Créer l'emprunt
  const result = await Borrow.create(newBorrow);
  
  return { 
    error: false, 
    message: "Emprunt créé avec succès", 
    id: result.insertId,
    exemplaires_restants: availabilityCheck.exemplaires_disponibles - 1
  };
}
```

#### Mise à jour après retour
```javascript
static async returnBook(borrowId) {
  // 1. Effectuer le retour
  const result = await Borrow.returnBook(borrowId);
  
  // 2. Calculer les nouvelles disponibilités
  const newAvailability = await new Promise((resolve, reject) => {
    const query = `
      SELECT 
        l.id,
        l.titre,
        3 as exemplaires_total,
        COUNT(e.id) as emprunts_actifs,
        GREATEST(0, 3 - COUNT(e.id)) as exemplaires_disponibles
      FROM livres l
      LEFT JOIN emprunts e ON l.id = e.livre_id AND e.date_retour_effective IS NULL
      WHERE l.id = ?
      GROUP BY l.id
    `;
    
    connection.query(query, [borrowInfo.livre_id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0]);
    });
  });

  // 3. Notifier les réservations en attente
  const ReservationService = require('./ReservationService');
  await ReservationService.promoteNextInQueue(borrowInfo.livre_id);

  return { 
    error: false, 
    message: "Livre retourné avec succès",
    exemplaires_disponibles: newAvailability.exemplaires_disponibles
  };
}
```

### 2. Book.js - Ajout du statut dynamique

```javascript
static async findAllWithAvailability() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        l.*,
        3 as exemplaires_total,
        COUNT(e.id) as emprunts_actifs,
        GREATEST(0, 3 - COUNT(e.id)) as exemplaires_disponibles,
        CASE 
          WHEN COUNT(e.id) >= 3 THEN 'indisponible'
          WHEN COUNT(e.id) = 0 THEN 'disponible'
          ELSE 'partiellement_disponible'
        END as statut
      FROM livres l
      LEFT JOIN emprunts e ON l.id = e.livre_id AND e.date_retour_effective IS NULL
      GROUP BY l.id
      ORDER BY l.titre
    `;
    
    connection.query(query, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
```

### 3. BorrowController.js - Nouvel endpoint

```javascript
// GET /api/borrows/availability/:bookId
async getBookAvailability(req, res) {
  try {
    const { bookId } = req.params;
    const availability = await Borrow.getBookAvailability(bookId);
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la disponibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}
```

## 🎨 Composants Frontend

### 1. page.tsx - Interface des livres

#### Affichage de la disponibilité
```tsx
interface Livre {
  id: number
  titre: string
  auteur: string
  genre: string
  isbn: string
  annee_publication: number
  image_url: string
  description: string
  disponible: boolean
  exemplaires_total: number
  exemplaires_disponibles: number
  emprunts_actifs?: number
  statut: string
  note_moyenne?: number
  nombre_notes?: number
}
```

#### Badge de statut dynamique
```tsx
const getStatusBadge = (livre: Livre) => {
  const { exemplaires_disponibles, exemplaires_total } = livre;
  
  if (exemplaires_disponibles === 0) {
    return <Badge variant="destructive">Tous empruntés</Badge>;
  } else if (exemplaires_disponibles === exemplaires_total) {
    return <Badge variant="default">Tous disponibles</Badge>;
  } else {
    return <Badge variant="secondary">{exemplaires_disponibles} disponible(s)</Badge>;
  }
};
```

#### Bouton d'emprunt conditionnel
```tsx
<Button
  onClick={() => handleEmprunter(livre.id)}
  disabled={livre.exemplaires_disponibles === 0 || isEmprunting}
  className="w-full"
>
  {isEmprunting ? (
    "Emprunt en cours..."
  ) : livre.exemplaires_disponibles === 0 ? (
    "En attente de retour"
  ) : (
    `Emprunter (${livre.exemplaires_disponibles} dispo)`
  )}
</Button>
```

#### Actualisation automatique
```tsx
const fetchLivres = async () => {
  try {
    const response = await api.get('/livres');
    if (response.data.success) {
      setLivres(response.data.data);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les livres",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

// Actualisation après chaque emprunt
const handleEmprunter = async (livreId: number) => {
  setIsEmprunting(true);
  try {
    const response = await api.post('/emprunts', {
      livre_id: livreId,
      date_retour_prevue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    if (response.data.success) {
      toast({
        title: "Succès",
        description: "Livre emprunté avec succès",
      });
      
      // Actualiser la liste des livres pour refléter la nouvelle disponibilité
      await fetchLivres();
    }
  } catch (error) {
    // Gestion d'erreur
  } finally {
    setIsEmprunting(false);
  }
};
```

### 2. Interface des emprunts - Retour avec confirmation

```tsx
// Dialog de confirmation pour le retour
<Dialog open={returnDialog.open} onOpenChange={(open) => 
  setReturnDialog({ open, empruntId: null })
}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmer le retour</DialogTitle>
    </DialogHeader>
    <p>Êtes-vous sûr de vouloir retourner ce livre ?</p>
    <div className="flex justify-end gap-2 mt-4">
      <Button 
        variant="outline" 
        onClick={() => setReturnDialog({ open: false, empruntId: null })}
      >
        Annuler
      </Button>
      <Button onClick={confirmReturn}>
        Confirmer le retour
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

## 🧪 Tests et Validation

### Scripts de test conservés
- `test-connection.js` - Test de connexion DB
- `test-exemplaires-system.js` - Test complet du système d'exemplaires
- `test-api-exemplaires.js` - Test des API d'exemplaires
- `test-emprunts.js` - Test des emprunts de base
- `test-livres-api.js` - Test des API de livres

### Scénarios testés
1. **Emprunt multiple** - 3 utilisateurs empruntent le même livre
2. **Blocage au 4ème emprunt** - Vérification du message d'erreur
3. **Retour et libération** - Vérification de la mise à jour
4. **Double emprunt** - Prévention de l'emprunt multiple par le même utilisateur
5. **Synchronisation UI** - Mise à jour en temps réel de l'interface

## 📊 Métriques et Monitoring

### Logs automatiques
```javascript
console.log(`📚 Emprunt créé - Livre ${borrowData.livre_id}: ${availabilityCheck.emprunts_actifs + 1}/3 exemplaires empruntés`);
console.log(`📚 Retour effectué - Livre ${borrowInfo.livre_id}: ${newAvailability.emprunts_actifs}/3 exemplaires empruntés`);
```

### Données exposées
- Nombre total d'exemplaires (3)
- Nombre d'emprunts actifs
- Nombre d'exemplaires disponibles
- Statut calculé dynamiquement

## 🔧 Configuration et Déploiement

### Migration base de données
```bash
# Exécuter la migration pour ajouter les colonnes
node run-migration-exemplaires.js
```

### Variables d'environnement
Aucune nouvelle variable nécessaire - utilise la configuration DB existante.

### Intégration avec le système de réservations
Le système s'intègre automatiquement avec `ReservationService.promoteNextInQueue()` pour notifier les utilisateurs en attente quand un exemplaire devient disponible.

## 🎉 Fonctionnalités Clés

✅ **3 exemplaires par livre** - Gestion automatique du stock  
✅ **Emprunts simultanés** - Jusqu'à 3 utilisateurs différents  
✅ **Prévention doublons** - Un utilisateur ne peut emprunter qu'une fois  
✅ **Mise à jour temps réel** - UI synchronisée avec la DB  
✅ **Boutons adaptatifs** - États visuels selon disponibilité  
✅ **Badges informatifs** - Indication claire du statut  
✅ **Intégration réservations** - Promotion automatique de la file d'attente  
✅ **Tests complets** - Validation de tous les scénarios  

## 🚀 Prochaines Améliorations Possibles

- **Configuration flexible** - Nombre d'exemplaires configurable par livre
- **Analytics avancés** - Taux d'utilisation par livre
- **Notifications push** - Alertes temps réel de disponibilité
- **Gestion des dommages** - Marquage d'exemplaires endommagés
- **Historique détaillé** - Traçabilité par exemplaire individuel
