const db = require('../config/db');

exports.getAllUsers = (req, res) => {
  db.query('SELECT id, nom, prenom, email, role, useractive FROM utilisateurs WHERE role = "etudiant"', (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json(results);
  });
};

exports.updateUser = (req, res) => {
  const { id, useractive } = req.body;
  db.query('UPDATE utilisateurs SET useractive=? WHERE id=?', [useractive, id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ message: 'Utilisateur mis à jour' });
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM utilisateurs WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ message: 'Utilisateur supprimé' });
  });
};
