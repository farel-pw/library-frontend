const db = require('../config/db');

exports.add = (req, res) => {
  const { livre_id, note, commentaire } = req.body;
  const utilisateur_id = req.user.id;
  if (!livre_id || !note || !commentaire) return res.status(400).json({ message: 'Champs manquants' });
  db.query('INSERT INTO commentaires (utilisateur_id, livre_id, note, commentaire) VALUES (?, ?, ?, ?)',
    [utilisateur_id, livre_id, note, commentaire],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
      res.status(201).json({ message: 'Commentaire ajouté', id: result.insertId });
    }
  );
};

exports.getByLivre = (req, res) => {
  const { id } = req.params;
  db.query('SELECT c.*, u.nom, u.prenom FROM commentaires c JOIN utilisateurs u ON c.utilisateur_id = u.id WHERE c.livre_id=?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
      res.json(results);
    }
  );
};
