const { pool } = require('../config/db');

const createJob = async ({
  recruiterId,
  title,
  companyName,
  location,
  jobType,
  salary,
  description,
  skillsRequired,
  applicationDeadline,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO jobs
      (recruiter_id, title, company_name, location, job_type, salary, description,
       skills_required, application_deadline)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recruiterId,
      title,
      companyName,
      location,
      jobType,
      salary,
      description,
      skillsRequired,
      applicationDeadline,
    ]
  );

  return findJobById(result.insertId);
};

const findJobById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, recruiter_id, title, company_name, location, job_type, salary,
      description, skills_required, application_deadline, created_at, updated_at
     FROM jobs
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

const findJobsByRecruiterId = async (recruiterId) => {
  const [rows] = await pool.execute(
    `SELECT id, recruiter_id, title, company_name, location, job_type, salary,
      description, skills_required, application_deadline, created_at, updated_at
     FROM jobs
     WHERE recruiter_id = ?
     ORDER BY created_at DESC`,
    [recruiterId]
  );

  return rows;
};

const findAllJobs = async () => {
  const [rows] = await pool.execute(
    `SELECT id, recruiter_id, title, company_name, location, job_type, salary,
      description, skills_required, application_deadline, created_at, updated_at
     FROM jobs
     ORDER BY created_at DESC`
  );

  return rows;
};

const updateJobById = async (id, jobData) => {
  await pool.execute(
    `UPDATE jobs
     SET title = ?, company_name = ?, location = ?, job_type = ?, salary = ?,
      description = ?, skills_required = ?, application_deadline = ?
     WHERE id = ?`,
    [
      jobData.title,
      jobData.companyName,
      jobData.location,
      jobData.jobType,
      jobData.salary,
      jobData.description,
      jobData.skillsRequired,
      jobData.applicationDeadline,
      id,
    ]
  );

  return findJobById(id);
};

const deleteJobById = async (id) => {
  const [result] = await pool.execute('DELETE FROM jobs WHERE id = ?', [id]);

  return result.affectedRows > 0;
};

module.exports = {
  createJob,
  findJobById,
  findAllJobs,
  findJobsByRecruiterId,
  updateJobById,
  deleteJobById,
};
