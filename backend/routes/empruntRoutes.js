const express = require('express');
const router = express.Router();
const empruntController = require('../controllers/empruntController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, empruntController.create);
router.post('/retour', auth, empruntController.returnBook);
router.get('/mes-emprunts', auth, empruntController.getUserEmprunts);

module.exports = router;
