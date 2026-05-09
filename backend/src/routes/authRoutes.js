const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile', protect, authController.getProfile);
router.get('/protected-test', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated user route accessed successfully',
    user_id: req.user.id,
    role: req.user.role,
  });
});
router.get('/student-test', protect, authorizeRoles('student'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student protected route accessed successfully',
    user_id: req.user.id,
    role: req.user.role,
  });
});
router.get('/recruiter-test', protect, authorizeRoles('recruiter'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Recruiter protected route accessed successfully',
    user_id: req.user.id,
    role: req.user.role,
  });
});
router.get('/admin-test', protect, authorizeRoles('admin'), authController.getAdminTest);

module.exports = router;
