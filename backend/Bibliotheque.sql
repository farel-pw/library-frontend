-- Créer la base
CREATE DATABASE IF NOT EXISTS bibliotheque;
USE bibliotheque;

-- Table utilisateurs
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,  -- Longueur adaptée pour le hash
  useractive TINYINT(1) NOT NULL DEFAULT 1,  -- 0 = inactif, 1 = actif
  date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_maj DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Mise à jour auto
  role ENUM('etudiant', 'admin') DEFAULT 'etudiant'
);

-- Table livres
CREATE TABLE livres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(150) NOT NULL,
  auteur VARCHAR(100) NOT NULL,
  genre VARCHAR(50),
  isbn VARCHAR(13) UNIQUE,  -- Ajout ISBN
  annee_publication YEAR,
  image_url VARCHAR(255) COMMENT 'URL de la couverture du livre',
  description TEXT COMMENT 'Description complète du livre',
  disponible TINYINT(1) DEFAULT 1
);


-- Table emprunts
CREATE TABLE emprunts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  date_emprunt DATE NOT NULL,
  date_retour_prevue DATE NOT NULL,  -- Ajout date retour prévue
  date_retour_effective DATE,  -- Renommé pour clarté
  rendu BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
);

-- Table commentaires
CREATE TABLE commentaires (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  note TINYINT CHECK (note BETWEEN 1 AND 5),  -- Optimisation type
  commentaire TEXT,  -- Renommé pour éviter confusion
  date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
);
-- 6. Table réservations (optionnelle mais utile)
CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  livre_id INT NOT NULL,
  date_reservation DATETIME DEFAULT CURRENT_TIMESTAMP,
  statut ENUM('en_attente', 'annulée', 'validée') DEFAULT 'en_attente',
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
);

-- 7. Table logs (pour suivi admin / audit)
CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT,
  action TEXT,
  date_log DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- 8. Index pour performance (optionnels mais recommandés)
CREATE INDEX idx_email ON utilisateurs(email);
CREATE INDEX idx_titre ON livres(titre);
CREATE INDEX idx_emprunts_utilisateur ON emprunts(utilisateur_id);