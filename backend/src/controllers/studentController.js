const StudentProfile = require('../models/StudentProfile');
const {
  validateStudentProfileInput,
  formatStudentProfileInput,
} = require('../validators/profileValidator');

const createProfile = async (req, res) => {
  try {
    const existingProfile = await StudentProfile.findProfileByUserId(req.user.id);

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'Student profile already exists',
      });
    }

    const errors = validateStudentProfileInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const profile = await StudentProfile.createProfile({
      userId: req.user.id,
      ...formatStudentProfileInput(req.body),
    });

    return res.status(201).json({
      success: true,
      message: 'Student profile created successfully',
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create student profile',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const getOwnProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findProfileByUserId(req.user.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student profile fetched successfully',
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch student profile',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const updateOwnProfile = async (req, res) => {
  try {
    const existingProfile = await StudentProfile.findProfileByUserId(req.user.id);

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const errors = validateStudentProfileInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const profile = await StudentProfile.updateProfileByUserId(
      req.user.id,
      formatStudentProfileInput(req.body)
    );

    return res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update student profile',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

module.exports = {
  createProfile,
  getOwnProfile,
  updateOwnProfile,
};
