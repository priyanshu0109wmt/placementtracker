const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../validators/authValidator');

const sanitizeUser = (user) => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
});

const register = async (req, res) => {
  try {
    const errors = validateRegisterInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const { full_name, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.createUser({
      fullName: full_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validateLoginInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const { email, password } = req.body;
    const user = await User.findUserByEmail(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Protected route accessed successfully',
    user: sanitizeUser(req.user),
  });
};

const getAdminTest = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin protected route accessed successfully',
    user: sanitizeUser(req.user),
  });
};

module.exports = {
  register,
  login,
  getProfile,
  getAdminTest,
};
