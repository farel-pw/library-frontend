const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const livreRoutes = require('./routes/livreRoutes');
const empruntRoutes = require('./routes/empruntRoutes');
const commentaireRoutes = require('./routes/commentaireRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes publiques
app.use('/auth', authRoutes);
app.use('/livres', livreRoutes);
app.use('/emprunts', empruntRoutes);
app.use('/commentaires', commentaireRoutes);
// Nouvelle route réservation
const reservationRoutes = require('./routes/reservationRoutes');
app.use('/reservations', reservationRoutes);
// Routes admin
app.use('/admin', adminRoutes);

// Gestion des erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log('Serveur backend démarré sur le port', PORT);
});
