const express = require('express');
const studentController = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('student'));

router.post('/profile', studentController.createProfile);
router.get('/profile', studentController.getOwnProfile);
router.put('/profile', studentController.updateOwnProfile);

module.exports = router;
