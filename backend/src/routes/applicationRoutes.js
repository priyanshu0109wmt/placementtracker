const express = require('express');
const applicationController = require('../controllers/applicationController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { handleResumeUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.put(
  '/:applicationId/status',
  protect,
  authorizeRoles('recruiter'),
  applicationController.updateApplicationStatus
);

router.get(
  '/:applicationId/resume',
  protect,
  authorizeRoles('recruiter'),
  applicationController.downloadResume
);

router.use(protect);
router.use(authorizeRoles('student'));

router.post('/', handleResumeUpload, applicationController.applyToJob);
router.get('/my-applications', applicationController.getMyApplications);

module.exports = router;
