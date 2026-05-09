const { pool } = require('../config/db');

const createProfile = async ({
  userId,
  collegeName,
  branch,
  graduationYear,
  skills,
  phone,
  linkedinUrl,
  githubUrl,
  bio,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO student_profiles
      (user_id, college_name, branch, graduation_year, skills, phone, linkedin_url, github_url, bio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      collegeName,
      branch,
      graduationYear,
      skills,
      phone,
      linkedinUrl,
      githubUrl,
      bio,
    ]
  );

  return findProfileById(result.insertId);
};

const findProfileById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, college_name, branch, graduation_year, skills, phone,
      linkedin_url, github_url, bio, created_at, updated_at
     FROM student_profiles
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

const findProfileByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, college_name, branch, graduation_year, skills, phone,
      linkedin_url, github_url, bio, created_at, updated_at
     FROM student_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
};

const updateProfileByUserId = async (userId, profileData) => {
  await pool.execute(
    `UPDATE student_profiles
     SET college_name = ?, branch = ?, graduation_year = ?, skills = ?, phone = ?,
      linkedin_url = ?, github_url = ?, bio = ?
     WHERE user_id = ?`,
    [
      profileData.collegeName,
      profileData.branch,
      profileData.graduationYear,
      profileData.skills,
      profileData.phone,
      profileData.linkedinUrl,
      profileData.githubUrl,
      profileData.bio,
      userId,
    ]
  );

  return findProfileByUserId(userId);
};

module.exports = {
  createProfile,
  findProfileByUserId,
  updateProfileByUserId,
};
