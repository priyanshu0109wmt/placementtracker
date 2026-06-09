const path = require('path');
const fs = require('fs');
const multer = require('multer');

const resumesDirectory = path.resolve(__dirname, '../../uploads/resumes');
const maxResumeSize = 5 * 1024 * 1024;

fs.mkdirSync(resumesDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExtension = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdfMime || !isPdfExtension) {
    return cb(new Error('Only PDF resume files are allowed'));
  }

  return cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxResumeSize,
  },
}).single('resume');

const handleResumeUpload = (req, res, next) => {
  uploadResume(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Resume PDF must be 5MB or smaller',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload resume',
    });
  });
};

module.exports = {
  handleResumeUpload,
  resumesDirectory,
};
