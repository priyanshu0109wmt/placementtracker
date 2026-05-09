const { pool } = require('../config/db');

const createApplication = async ({
  studentId,
  jobId,
  resumeLink,
  coverLetter,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO applications (student_id, job_id, resume_link, cover_letter)
     VALUES (?, ?, ?, ?)`,
    [studentId, jobId, resumeLink, coverLetter]
  );

  return findApplicationById(result.insertId);
};

const findApplicationById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, student_id, job_id, resume_link, cover_letter, status, applied_at
     FROM applications
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

const findApplicationByStudentAndJob = async (studentId, jobId) => {
  const [rows] = await pool.execute(
    `SELECT id, student_id, job_id, resume_link, cover_letter, status, applied_at
     FROM applications
     WHERE student_id = ? AND job_id = ?
     LIMIT 1`,
    [studentId, jobId]
  );

  return rows[0] || null;
};

const findApplicationsByStudentId = async (studentId) => {
  const [rows] = await pool.execute(
    `SELECT
      applications.id,
      applications.student_id,
      applications.job_id,
      applications.resume_link,
      applications.cover_letter,
      applications.status,
      applications.applied_at,
      jobs.title,
      jobs.company_name,
      jobs.location,
      jobs.job_type,
      jobs.salary,
      jobs.application_deadline
     FROM applications
     INNER JOIN jobs ON applications.job_id = jobs.id
     WHERE applications.student_id = ?
     ORDER BY applications.applied_at DESC`,
    [studentId]
  );

  return rows;
};

module.exports = {
  createApplication,
  findApplicationByStudentAndJob,
  findApplicationsByStudentId,
};
