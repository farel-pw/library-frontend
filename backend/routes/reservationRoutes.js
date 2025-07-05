const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');


// Réserver un livre
router.post('/reserver', reservationController.reserverLivre);

// Récupérer les réservations d'un utilisateur
router.get('/utilisateur/:utilisateur_id', reservationController.getReservationsByUser);

module.exports = router;
