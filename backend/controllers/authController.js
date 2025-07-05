const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'votre_cle_secrete';

exports.register = (req, res) => {
  const { nom, prenom, email, password, studentId, department } = req.body;
  if (!nom || !prenom || !email || !password) {
    console.log('Champs manquants:', { nom, prenom, email, password });
    return res.status(400).json({ message: 'Champs manquants', details: { nom, prenom, email, password } });
  }
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Erreur lors du hash du mot de passe:', err);
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }
    db.query(
      'INSERT INTO utilisateurs (nom, prenom, email, password, studentId, department) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hash, studentId || null, department || null],
      (err, result) => {
        if (err) {
          console.error('Erreur SQL à l\'inscription:', err);
          return res.status(500).json({ message: 'Erreur serveur', error: err });
        }
        res.status(201).json({ message: 'Inscription réussie' });
      }
    );
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  console.log('Tentative de connexion avec:', { email });
  db.query('SELECT * FROM utilisateurs WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erreur SQL lors de la connexion:', err);
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }
    if (results.length === 0) {
      console.warn('Utilisateur non trouvé pour email:', email);
      return res.status(401).json({ message: 'Utilisateur non trouvé', email });
    }
    const user = results[0];
    // Correction : compatibilité nom de colonne
    const hash = user.password || user.mot_de_passe;
    if (!hash) {
      console.error('Aucun hash de mot de passe trouvé pour cet utilisateur:', user);
      return res.status(500).json({ message: 'Aucun mot de passe stocké pour cet utilisateur', user });
    }
    console.log('Mot de passe reçu:', password);
    console.log('Hash en base:', hash);
    bcrypt.compare(password, hash, (err, valid) => {
      if (err) {
        console.error('Erreur lors de la comparaison du mot de passe:', err);
        return res.status(500).json({ message: 'Erreur serveur', error: err });
      }
      if (!valid) {
        console.warn('Mot de passe incorrect pour email:', email);
        return res.status(401).json({ message: 'Mot de passe incorrect', email });
      }
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
      res.json({ token, user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role } });
    });
  });
};
