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

const findApplicationsByJobId = async (jobId) => {
  const [rows] = await pool.execute(
    `SELECT
      applications.id,
      applications.student_id,
      applications.job_id,
      applications.resume_link,
      applications.cover_letter,
      applications.status,
      applications.applied_at,
      users.full_name AS student_name,
      users.email AS student_email,
      jobs.title AS job_title,
      jobs.company_name
     FROM applications
     INNER JOIN users ON applications.student_id = users.id
     INNER JOIN jobs ON applications.job_id = jobs.id
     WHERE applications.job_id = ?
     ORDER BY applications.applied_at DESC`,
    [jobId]
  );

  return rows;
};

const findApplicationWithJobById = async (applicationId) => {
  const [rows] = await pool.execute(
    `SELECT
      applications.id,
      applications.student_id,
      applications.job_id,
      applications.resume_link,
      applications.cover_letter,
      applications.status,
      applications.applied_at,
      jobs.recruiter_id,
      jobs.title AS job_title,
      jobs.company_name,
      users.full_name AS student_name,
      users.email AS student_email
     FROM applications
     INNER JOIN jobs ON applications.job_id = jobs.id
     INNER JOIN users ON applications.student_id = users.id
     WHERE applications.id = ?
     LIMIT 1`,
    [applicationId]
  );

  return rows[0] || null;
};

const updateApplicationStatusById = async (applicationId, status) => {
  await pool.execute(
    'UPDATE applications SET status = ? WHERE id = ?',
    [status, applicationId]
  );

  return findApplicationWithJobById(applicationId);
};

module.exports = {
  createApplication,
  findApplicationByStudentAndJob,
  findApplicationsByStudentId,
  findApplicationsByJobId,
  findApplicationWithJobById,
  updateApplicationStatusById,
};
