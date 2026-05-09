const isValidUrl = (url) => {
  if (!url) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
};

const isValidGraduationYear = (year) => {
  const numericYear = Number(year);
  const currentYear = new Date().getFullYear();

  return Number.isInteger(numericYear)
    && numericYear >= currentYear - 10
    && numericYear <= currentYear + 10;
};

const cleanOptionalString = (value) => {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const hasMinLength = (value, minLength) => {
  return typeof value === 'string' && value.trim().length >= minLength;
};

const validateStudentProfileInput = (data) => {
  const errors = [];

  if (!hasMinLength(data.college_name, 2)) {
    errors.push('College name must be at least 2 characters long');
  }

  if (!hasMinLength(data.branch, 2)) {
    errors.push('Branch must be at least 2 characters long');
  }

  if (!data.graduation_year || !isValidGraduationYear(data.graduation_year)) {
    errors.push('Graduation year must be a valid year');
  }

  if (data.phone && String(data.phone).trim().length > 20) {
    errors.push('Phone must not exceed 20 characters');
  }

  if (!isValidUrl(data.linkedin_url)) {
    errors.push('LinkedIn URL must be a valid http or https URL');
  }

  if (!isValidUrl(data.github_url)) {
    errors.push('GitHub URL must be a valid http or https URL');
  }

  if (data.bio && data.bio.trim().length > 1000) {
    errors.push('Bio must not exceed 1000 characters');
  }

  return errors;
};

const formatStudentProfileInput = (data) => ({
  collegeName: data.college_name.trim(),
  branch: data.branch.trim(),
  graduationYear: Number(data.graduation_year),
  skills: cleanOptionalString(data.skills),
  phone: cleanOptionalString(data.phone),
  linkedinUrl: cleanOptionalString(data.linkedin_url),
  githubUrl: cleanOptionalString(data.github_url),
  bio: cleanOptionalString(data.bio),
});

module.exports = {
  validateStudentProfileInput,
  formatStudentProfileInput,
};
