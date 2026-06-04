const createJobForm = document.getElementById("createJobForm");
const createJobButton = document.getElementById("createJobButton");
const cancelEditJobButton = document.getElementById("cancelEditJobButton");
const jobFormTitle = document.getElementById("jobFormTitle");
const jobFormDescription = document.getElementById("jobFormDescription");
const recruiterJobsContainer = document.getElementById("recruiterJobsContainer");
const recruiterJobsMessage = document.getElementById("recruiterJobsMessage");
let recruiterJobs = [];
let editingJobId = null;

initRecruiterJobs();

function initRecruiterJobs() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupRecruiterJobs);
    return;
  }

  setupRecruiterJobs();
}

function setupRecruiterJobs() {
  if (!canManageRecruiterJobs()) {
    return;
  }

  setMinimumDeadline();
  loadRecruiterJobs();

  if (createJobForm) {
    createJobForm.addEventListener("submit", handleJobFormSubmit);
  }

  if (cancelEditJobButton) {
    cancelEditJobButton.addEventListener("click", cancelJobEdit);
  }
}

function canManageRecruiterJobs() {
  return isLoggedIn() && hasRequiredRole("recruiter");
}

async function loadRecruiterJobs() {
  showRecruiterJobsLoading();
  clearRecruiterJobsMessage();

  try {
    const data = await getDataWithAuth("/jobs/my-jobs");
    recruiterJobs = data.jobs || [];
    renderRecruiterJobs(recruiterJobs);
  } catch (error) {
    recruiterJobs = [];
    renderRecruiterJobs([]);
    handleRecruiterJobsError(error);
  }
}

function renderRecruiterJobs(jobs) {
  if (!recruiterJobsContainer) {
    return;
  }

  if (!jobs.length) {
    recruiterJobsContainer.innerHTML = `
      <article class="empty-state">
        <h2>No jobs posted yet</h2>
        <p>Create your first job post to start receiving applications.</p>
      </article>
    `;
    return;
  }

  recruiterJobsContainer.innerHTML = jobs.map(renderRecruiterJobCard).join("");
  setupEditJobButtons();
  setupDeleteJobButtons();
}

function renderRecruiterJobCard(job) {
  return `
    <article class="job-card recruiter-job-card" data-recruiter-job-id="${escapeHtml(String(job.id || ""))}">
      <div class="job-card-header">
        <div>
          <h2>${escapeHtml(job.title || "Untitled Job")}</h2>
          <p>${escapeHtml(job.company_name || "Company not specified")}</p>
        </div>
        <span class="job-type">${escapeHtml(formatText(job.job_type || "Job"))}</span>
      </div>

      <dl class="job-meta">
        <div>
          <dt>Location</dt>
          <dd>${escapeHtml(job.location || "Not specified")}</dd>
        </div>
        <div>
          <dt>Salary</dt>
          <dd>${escapeHtml(job.salary || "Not disclosed")}</dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd>${escapeHtml(formatDate(job.application_deadline))}</dd>
        </div>
      </dl>

      <div class="job-card-actions">
        <button class="btn btn-secondary edit-job-button" type="button" data-job-id="${escapeHtml(String(job.id || ""))}">
          Edit
        </button>
        <button class="btn btn-secondary delete-job-button" type="button" data-job-id="${escapeHtml(String(job.id || ""))}">
          Delete Job
        </button>
      </div>
    </article>
  `;
}

async function handleJobFormSubmit(event) {
  event.preventDefault();
  clearRecruiterJobsMessage();

  const payload = getJobFormPayload();
  const errors = validateJobFormPayload(payload);

  if (errors.length > 0) {
    showRecruiterJobsMessage(errors.join(". "), "error");
    return;
  }

  setJobFormLoading(true);

  try {
    const data = editingJobId
      ? await putDataWithAuth(`/jobs/${encodeURIComponent(editingJobId)}`, payload)
      : await postDataWithAuth("/jobs", payload);

    showRecruiterJobsMessage(
      data.message || (editingJobId ? "Job updated successfully." : "Job created successfully."),
      "success"
    );
    resetJobFormMode();
    await refreshRecruiterDashboardData();
  } catch (error) {
    handleRecruiterJobsError(error);
  } finally {
    setJobFormLoading(false);
  }
}

function getJobFormPayload() {
  const formData = new FormData(createJobForm);

  return {
    title: formData.get("title").trim(),
    company_name: formData.get("company_name").trim(),
    location: formData.get("location").trim(),
    job_type: formData.get("job_type"),
    salary: formData.get("salary").trim(),
    description: formData.get("description").trim(),
    skills_required: formData.get("skills_required").trim(),
    application_deadline: formData.get("application_deadline"),
  };
}

function validateJobFormPayload(payload) {
  const errors = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(payload.application_deadline);

  if (payload.title.length < 2) errors.push("Job title must be at least 2 characters long");
  if (payload.title.length > 150) errors.push("Job title must be 150 characters or fewer");
  if (payload.company_name.length < 2) errors.push("Company name must be at least 2 characters long");
  if (payload.company_name.length > 150) errors.push("Company name must be 150 characters or fewer");
  if (payload.location.length < 2) errors.push("Location must be at least 2 characters long");
  if (payload.location.length > 150) errors.push("Location must be 150 characters or fewer");
  if (payload.salary.length > 100) errors.push("Salary must be 100 characters or fewer");
  if (!["full-time", "part-time", "internship", "contract"].includes(payload.job_type)) errors.push("Select a valid job type");
  if (payload.description.length < 10) errors.push("Description must be at least 10 characters long");
  if (payload.skills_required.length < 2) errors.push("Skills required must be at least 2 characters long");
  if (!payload.application_deadline || Number.isNaN(deadline.getTime()) || deadline < today) {
    errors.push("Application deadline must be today or a future date");
  }

  return errors;
}

function setupEditJobButtons() {
  const buttons = recruiterJobsContainer.querySelectorAll(".edit-job-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => startJobEdit(button.dataset.jobId));
  });
}

function setupDeleteJobButtons() {
  const buttons = recruiterJobsContainer.querySelectorAll(".delete-job-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => handleDeleteJob(button));
  });
}

function startJobEdit(jobId) {
  const job = recruiterJobs.find((item) => String(item.id) === String(jobId));

  if (!job) {
    showRecruiterJobsMessage("Unable to load this job for editing.", "error");
    return;
  }

  editingJobId = job.id;
  populateJobForm(job);
  setJobFormMode("edit");
  clearRecruiterJobsMessage();
  createJobForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function populateJobForm(job) {
  createJobForm.elements.title.value = job.title || "";
  createJobForm.elements.company_name.value = job.company_name || "";
  createJobForm.elements.location.value = job.location || "";
  createJobForm.elements.job_type.value = job.job_type || "internship";
  createJobForm.elements.salary.value = job.salary || "";
  createJobForm.elements.skills_required.value = job.skills_required || "";
  createJobForm.elements.application_deadline.value = formatDateForInput(job.application_deadline);
  createJobForm.elements.description.value = job.description || "";
}

function cancelJobEdit() {
  resetJobFormMode();
  clearRecruiterJobsMessage();
}

function resetJobFormMode() {
  editingJobId = null;
  createJobForm.reset();
  setMinimumDeadline();
  setJobFormMode("create");
}

function setJobFormMode(mode) {
  const isEditMode = mode === "edit";

  if (jobFormTitle) {
    jobFormTitle.textContent = isEditMode ? "Update Job" : "Create Job";
  }

  if (jobFormDescription) {
    jobFormDescription.textContent = isEditMode
      ? "Update this opportunity while keeping applicants and status history intact."
      : "Post a new opportunity for students to discover and apply.";
  }

  if (createJobButton) {
    createJobButton.textContent = isEditMode ? "Update Job" : "Create Job";
  }

  if (cancelEditJobButton) {
    cancelEditJobButton.hidden = !isEditMode;
  }
}

async function handleDeleteJob(button) {
  const jobId = button.dataset.jobId;

  if (!jobId) {
    showRecruiterJobsMessage("Job id is missing.", "error");
    return;
  }

  setDeleteJobLoading(button, true);
  clearRecruiterJobsMessage();

  try {
    const data = await deleteDataWithAuth(`/jobs/${encodeURIComponent(jobId)}`);
    showRecruiterJobsMessage(data.message || "Job deleted successfully.", "success");
    if (String(editingJobId) === String(jobId)) {
      resetJobFormMode();
    }
    await refreshRecruiterDashboardData();
  } catch (error) {
    handleRecruiterJobsError(error);
  } finally {
    setDeleteJobLoading(button, false);
  }
}

async function refreshRecruiterDashboardData() {
  await loadRecruiterJobs();

  if (typeof loadRecruiterApplicants === "function") {
    await loadRecruiterApplicants();
  }
}

function showRecruiterJobsLoading() {
  if (!recruiterJobsContainer) {
    return;
  }

  recruiterJobsContainer.innerHTML = `
    <article class="card loading-card">
      <span class="loader" aria-hidden="true"></span>
      <p>Loading your jobs...</p>
    </article>
  `;
}

function setJobFormLoading(isLoading) {
  if (!createJobButton) {
    return;
  }

  createJobButton.disabled = isLoading;
  createJobButton.textContent = isLoading
    ? (editingJobId ? "Updating..." : "Creating...")
    : (editingJobId ? "Update Job" : "Create Job");

  if (cancelEditJobButton) {
    cancelEditJobButton.disabled = isLoading;
  }
}

function setDeleteJobLoading(button, isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Deleting..." : "Delete Job";
}

function handleRecruiterJobsError(error) {
  if (error.status === 401) {
    showRecruiterJobsMessage("Your session has expired. Please login again.", "error");
    clearAuthSession();
    redirectToLogin(900);
    return;
  }

  if (error.status === 403) {
    showRecruiterJobsMessage("Only recruiter accounts can manage jobs.", "error");
    return;
  }

  if (error.errors && error.errors.length > 0) {
    showRecruiterJobsMessage(error.errors.join(". "), "error");
    return;
  }

  showRecruiterJobsMessage(error.message || "Unable to manage jobs. Please try again.", "error");
}

function showRecruiterJobsMessage(message, type) {
  if (!recruiterJobsMessage) {
    return;
  }

  recruiterJobsMessage.textContent = message;
  recruiterJobsMessage.className = `message message-${type}`;
}

function clearRecruiterJobsMessage() {
  if (!recruiterJobsMessage) {
    return;
  }

  recruiterJobsMessage.textContent = "";
  recruiterJobsMessage.className = "message";
}

function setMinimumDeadline() {
  const deadlineInput = document.getElementById("applicationDeadline");

  if (!deadlineInput) {
    return;
  }

  deadlineInput.min = new Date().toISOString().split("T")[0];
}

function formatDateForInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).split("T")[0];
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "No deadline";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatText(value) {
  return String(value).replaceAll("_", " ");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
