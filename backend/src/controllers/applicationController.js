const fs = require('fs/promises');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { resumesDirectory } = require('../middleware/uploadMiddleware');
const {
  validateApplicationInput,
  validateApplicationStatusInput,
  formatApplicationInput,
} = require('../validators/applicationValidator');

const removeUploadedResume = async (file) => {
  if (!file) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    // Ignore cleanup failures so the API can still return the original error.
  }
};

const applyToJob = async (req, res) => {
  try {
    const errors = validateApplicationInput(req.body, req.file);

    if (errors.length > 0) {
      await removeUploadedResume(req.file);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const applicationData = formatApplicationInput(req.body, req.file);
    const job = await Job.findJobById(applicationData.jobId);

    if (!job) {
      await removeUploadedResume(req.file);

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
      await removeUploadedResume(req.file);

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
    await removeUploadedResume(req.file);

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

const downloadResume = async (req, res) => {
  try {
    const application = await Application.findApplicationWithJobById(
      req.params.applicationId
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (Number(application.recruiter_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only download resumes for your own jobs',
      });
    }

    if (!application.resume_path) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found',
      });
    }

    const resumeFileName = path.basename(application.resume_path);
    const resumePath = path.join(resumesDirectory, resumeFileName);

    return res.download(resumePath, resumeFileName, (error) => {
      if (error && !res.headersSent) {
        return res.status(404).json({
          success: false,
          message: 'Resume file not found',
        });
      }

      return undefined;
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to download resume',
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

const updateApplicationStatus = async (req, res) => {
  try {
    const errors = validateApplicationStatusInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const application = await Application.findApplicationWithJobById(
      req.params.applicationId
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (Number(application.recruiter_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your own jobs',
      });
    }

    const updatedApplication = await Application.updateApplicationStatusById(
      req.params.applicationId,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

module.exports = {
  applyToJob,
  downloadResume,
  getMyApplications,
  updateApplicationStatus,
};
