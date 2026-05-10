const express = require('express');
const applicationController = require('../controllers/applicationController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.put(
  '/:applicationId/status',
  protect,
  authorizeRoles('recruiter'),
  applicationController.updateApplicationStatus
);

router.use(protect);
router.use(authorizeRoles('student'));

router.post('/', applicationController.applyToJob);
router.get('/my-applications', applicationController.getMyApplications);

module.exports = router;
