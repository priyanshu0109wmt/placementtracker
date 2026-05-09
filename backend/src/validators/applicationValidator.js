const isPositiveInteger = (value) => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0;
};

const isValidResumeLink = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.startsWith('/uploads/')) {
    return true;
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
};

const validateApplicationInput = (data) => {
  const errors = [];

  if (!isPositiveInteger(data.job_id)) {
    errors.push('Valid job id is required');
  }

  if (!isValidResumeLink(data.resume_link)) {
    errors.push('Resume link must be a valid http URL, https URL, or uploads path');
  }

  if (data.cover_letter && String(data.cover_letter).trim().length > 2000) {
    errors.push('Cover letter must not exceed 2000 characters');
  }

  return errors;
};

const formatApplicationInput = (data) => ({
  jobId: Number(data.job_id),
  resumeLink: data.resume_link.trim(),
  coverLetter: data.cover_letter ? String(data.cover_letter).trim() : null,
});

module.exports = {
  validateApplicationInput,
  formatApplicationInput,
};
