const allowedRoles = ['student', 'recruiter', 'admin'];

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRegisterInput = ({ full_name, email, password, role }) => {
  const errors = [];

  if (!full_name || full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!role || !allowedRoles.includes(role)) {
    errors.push('Role must be student, recruiter, or admin');
  }

  return errors;
};

const validateLoginInput = ({ email, password }) => {
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
};

module.exports = {
  allowedRoles,
  validateRegisterInput,
  validateLoginInput,
};
