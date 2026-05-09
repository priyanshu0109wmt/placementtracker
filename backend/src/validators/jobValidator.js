const allowedJobTypes = ['full-time', 'part-time', 'internship', 'contract'];

const hasMinLength = (value, minLength) => {
  return typeof value === 'string' && value.trim().length >= minLength;
};

const cleanOptionalString = (value) => {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const isValidDeadline = (value) => {
  if (!value) {
    return false;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return false;
  }

  const deadline = new Date(timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return deadline >= today;
};

const validateJobInput = (data) => {
  const errors = [];

  if (!hasMinLength(data.title, 2)) {
    errors.push('Job title must be at least 2 characters long');
  }

  if (!hasMinLength(data.company_name, 2)) {
    errors.push('Company name must be at least 2 characters long');
  }

  if (!hasMinLength(data.location, 2)) {
    errors.push('Location must be at least 2 characters long');
  }

  if (!data.job_type || !allowedJobTypes.includes(data.job_type)) {
    errors.push('Job type must be full-time, part-time, internship, or contract');
  }

  if (!hasMinLength(data.description, 10)) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!hasMinLength(data.skills_required, 2)) {
    errors.push('Skills required must be at least 2 characters long');
  }

  if (!isValidDeadline(data.application_deadline)) {
    errors.push('Application deadline must be a valid today or future date');
  }

  return errors;
};

const formatJobInput = (data) => ({
  title: data.title.trim(),
  companyName: data.company_name.trim(),
  location: data.location.trim(),
  jobType: data.job_type,
  salary: cleanOptionalString(data.salary),
  description: data.description.trim(),
  skillsRequired: data.skills_required.trim(),
  applicationDeadline: data.application_deadline,
});

module.exports = {
  allowedJobTypes,
  validateJobInput,
  formatJobInput,
};
