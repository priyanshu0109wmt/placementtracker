const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile', protect, authController.getProfile);
router.get('/admin-test', protect, authorizeRoles('admin'), authController.getAdminTest);

module.exports = router;
