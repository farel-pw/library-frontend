const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/etudiants', auth, admin, adminController.getAllUsers);
router.put('/etudiants', auth, admin, adminController.updateUser);
router.delete('/etudiants/:id', auth, admin, adminController.deleteUser);

module.exports = router;
