const db = require('../config/db');

exports.reserverLivre = (req, res) => {
  const { utilisateur_id, livre_id } = req.body;
  if (!utilisateur_id || !livre_id) {
    return res.status(400).json({ message: "Champs manquants" });
  }
  db.query(
    "INSERT INTO reservations (utilisateur_id, livre_id) VALUES (?, ?)",
    [utilisateur_id, livre_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
      res.status(201).json({ message: "Réservation enregistrée" });
    }
  );
};

// Nouvelle route : récupérer les réservations d'un utilisateur avec infos livre
exports.getReservationsByUser = (req, res) => {
  const { utilisateur_id } = req.params;
  db.query(
    `SELECT r.id, r.livre_id, r.date_reservation, r.statut, l.titre as livre_titre, l.auteur as livre_auteur
     FROM reservations r
     JOIN livres l ON r.livre_id = l.id
     WHERE r.utilisateur_id = ?
     ORDER BY r.date_reservation DESC`,
    [utilisateur_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erreur serveur", error: err });
      res.json(results);
    }
  );
};
