const express = require('express');
const router = express.Router();
const commentaireController = require('../controllers/commentaireController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, commentaireController.add);
router.get('/:id', commentaireController.getByLivre);

module.exports = router;
