const Job = require('../models/Job');
const Application = require('../models/Application');
const {
  validateJobInput,
  formatJobInput,
} = require('../validators/jobValidator');

const isOwnJob = (job, recruiterId) => {
  return job && Number(job.recruiter_id) === Number(recruiterId);
};

const createJob = async (req, res) => {
  try {
    const errors = validateJobInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const job = await Job.createJob({
      recruiterId: req.user.id,
      ...formatJobInput(req.body),
    });

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAllJobs();

    return res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const getOwnJobs = async (req, res) => {
  try {
    const jobs = await Job.findJobsByRecruiterId(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Recruiter jobs fetched successfully',
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recruiter jobs',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const getOwnJobApplications = async (req, res) => {
  try {
    const job = await Job.findJobById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!isOwnJob(job, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only view applications for your own jobs',
      });
    }

    const applications = await Application.findApplicationsByJobId(job.id);

    return res.status(200).json({
      success: true,
      message: 'Job applications fetched successfully',
      count: applications.length,
      job: {
        id: job.id,
        title: job.title,
        company_name: job.company_name,
      },
      applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const updateOwnJob = async (req, res) => {
  try {
    const job = await Job.findJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!isOwnJob(job, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own jobs',
      });
    }

    const errors = validateJobInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const updatedJob = await Job.updateJobById(
      req.params.id,
      formatJobInput(req.body)
    );

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const deleteOwnJob = async (req, res) => {
  try {
    const job = await Job.findJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (!isOwnJob(job, req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own jobs',
      });
    }

    await Job.deleteJobById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getOwnJobs,
  getOwnJobApplications,
  updateOwnJob,
  deleteOwnJob,
};
