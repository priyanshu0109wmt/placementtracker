const Application = require('../models/Application');
const Job = require('../models/Job');
const {
  validateApplicationInput,
  formatApplicationInput,
} = require('../validators/applicationValidator');

const applyToJob = async (req, res) => {
  try {
    const errors = validateApplicationInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const applicationData = formatApplicationInput(req.body);
    const job = await Job.findJobById(applicationData.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const existingApplication = await Application.findApplicationByStudentAndJob(
      req.user.id,
      applicationData.jobId
    );

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    const application = await Application.createApplication({
      studentId: req.user.id,
      ...applicationData,
    });

    return res.status(201).json({
      success: true,
      message: 'Job application submitted successfully',
      application,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit job application',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findApplicationsByStudentId(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Applied jobs fetched successfully',
      count: applications.length,
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applied jobs',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
};
