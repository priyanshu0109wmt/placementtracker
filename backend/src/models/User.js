const { pool } = require('../config/db');

const createUser = async ({ fullName, email, password, role }) => {
  const [result] = await pool.execute(
    'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
    [fullName, email, password, role]
  );

  return findUserById(result.insertId);
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );

  return rows[0] || null;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};
