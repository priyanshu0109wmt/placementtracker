const express = require('express');
const jobController = require('../controllers/jobController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', jobController.getAllJobs);

router.use(protect);
router.use(authorizeRoles('recruiter'));

router.post('/', jobController.createJob);
router.get('/my-jobs', jobController.getOwnJobs);
router.get('/:jobId/applications', jobController.getOwnJobApplications);
router.put('/:id', jobController.updateOwnJob);
router.delete('/:id', jobController.deleteOwnJob);

module.exports = router;
