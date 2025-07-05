const db = require('../config/db');

exports.getAll = (req, res) => {
  const { titre, auteur, genre } = req.query;
  let sql = 'SELECT * FROM livres WHERE disponible = 1';
  const params = [];
  if (titre) {
    sql += ' AND titre LIKE ?';
    params.push(`%${titre}%`);
  }
  if (auteur) {
    sql += ' AND auteur LIKE ?';
    params.push(`%${auteur}%`);
  }
  if (genre && genre !== 'all') {
    sql += ' AND genre = ?';
    params.push(genre);
  }
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json(results);
  });
};

exports.create = (req, res) => {
  const { titre, auteur, genre, isbn, annee_publication, image_url, description } = req.body;
  if (!titre || !auteur) return res.status(400).json({ message: 'Champs obligatoires manquants' });
  db.query('INSERT INTO livres (titre, auteur, genre, isbn, annee_publication, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [titre, auteur, genre, isbn, annee_publication, image_url, description],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
      res.status(201).json({ message: 'Livre ajouté', id: result.insertId });
    }
  );
};

exports.update = (req, res) => {
  const { id, titre, auteur, genre, isbn, annee_publication, image_url, description, disponible } = req.body;
  if (!id) return res.status(400).json({ message: 'ID manquant' });
  db.query('UPDATE livres SET titre=?, auteur=?, genre=?, isbn=?, annee_publication=?, image_url=?, description=?, disponible=? WHERE id=?',
    [titre, auteur, genre, isbn, annee_publication, image_url, description, disponible, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
      res.json({ message: 'Livre modifié' });
    }
  );
};

exports.delete = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM livres WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
    res.json({ message: 'Livre supprimé' });
  });
};
