const isPositiveInteger = (value) => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0;
};

const allowedApplicationStatuses = ['shortlisted', 'rejected', 'accepted'];

const validateApplicationInput = (data, file) => {
  const errors = [];

  if (!isPositiveInteger(data.job_id)) {
    errors.push('Valid job id is required');
  }

  if (!file) {
    errors.push('Resume PDF is required');
  }

  if (data.cover_letter && String(data.cover_letter).trim().length > 2000) {
    errors.push('Cover letter must not exceed 2000 characters');
  }

  return errors;
};

const formatApplicationInput = (data, file) => ({
  jobId: Number(data.job_id),
  resumePath: file ? `uploads/resumes/${file.filename}` : null,
  coverLetter: data.cover_letter ? String(data.cover_letter).trim() : null,
});

const validateApplicationStatusInput = (data) => {
  const errors = [];

  if (!data.status || !allowedApplicationStatuses.includes(data.status)) {
    errors.push('Status must be shortlisted, rejected, or accepted');
  }

  return errors;
};

module.exports = {
  allowedApplicationStatuses,
  validateApplicationInput,
  validateApplicationStatusInput,
  formatApplicationInput,
};
