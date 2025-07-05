const express = require('express');
const router = express.Router();
const livreController = require('../controllers/livreController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/', auth, livreController.getAll);
router.post('/', auth, admin, livreController.create);
router.put('/', auth, admin, livreController.update);
router.delete('/:id', auth, admin, livreController.delete);

module.exports = router;
