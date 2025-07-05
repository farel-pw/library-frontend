const db = require('../config/db');

exports.create = (req, res) => {
  const { livre_id, date_retour_prevue } = req.body;
  const utilisateur_id = req.user.id;
  if (!livre_id || !date_retour_prevue) return res.status(400).json({ message: 'Champs manquants' });
  db.query('INSERT INTO emprunts (utilisateur_id, livre_id, date_emprunt, date_retour_prevue) VALUES (?, ?, CURDATE(), ?)',
    [utilisateur_id, livre_id, date_retour_prevue],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
      res.status(201).json({ message: 'Emprunt enregistré', id: result.insertId });
    }
  );
};

exports.returnBook = (req, res) => {
  const { emprunt_id } = req.body;
  const utilisateur_id = req.user.id;
  db.query('UPDATE emprunts SET date_retour_effective=CURDATE(), rendu=1 WHERE id=? AND utilisateur_id=?',
    [emprunt_id, utilisateur_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
      res.json({ message: 'Livre retourné' });
    }
  );
};

exports.getUserEmprunts = (req, res) => {
  const utilisateur_id = req.user.id;
  db.query('SELECT e.*, l.titre, l.auteur FROM emprunts e JOIN livres l ON e.livre_id = l.id WHERE e.utilisateur_id=?',
    [utilisateur_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
      res.json(results);
    }
  );
};
