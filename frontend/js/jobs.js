const jobsContainer = document.getElementById("jobsContainer");
const jobsMessage = document.getElementById("jobsMessage");

document.addEventListener("DOMContentLoaded", () => {
  loadJobs();
  setupApplyButtons();
});

async function loadJobs() {
  showJobsLoading();
  clearJobsMessage();

  try {
    const data = await getData("/jobs");
    renderJobs(data.jobs || []);
  } catch (error) {
    renderJobs([]);
    showJobsMessage(error.message || "Unable to load jobs. Please try again.", "error");
  }
}

function renderJobs(jobs) {
  if (!jobsContainer) {
    return;
  }

  if (!jobs.length) {
    jobsContainer.innerHTML = `
      <article class="empty-state">
        <h2>No jobs available</h2>
        <p>New placement opportunities will appear here when recruiters post them.</p>
      </article>
    `;
    return;
  }

  jobsContainer.innerHTML = jobs.map(renderJobCard).join("");
}

function renderJobCard(job) {
  const skills = formatSkills(job.skills_required);

  return `
    <article class="job-card">
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

      <div class="skills-list">
        ${skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}
      </div>

      <div class="application-controls">
        <label for="resumeLink-${escapeHtml(String(job.id || ""))}">Resume Link</label>
        <input
          id="resumeLink-${escapeHtml(String(job.id || ""))}"
          class="resume-link-input"
          type="url"
          placeholder="https://example.com/resume.pdf"
          data-resume-for="${escapeHtml(String(job.id || ""))}"
        >
        <button class="btn btn-primary apply-button" type="button" data-job-id="${escapeHtml(String(job.id || ""))}">
          Apply
        </button>
      </div>
    </article>
  `;
}

function setupApplyButtons() {
  if (!jobsContainer) {
    return;
  }

  jobsContainer.addEventListener("click", (event) => {
    const applyButton = event.target.closest(".apply-button");

    if (!applyButton) {
      return;
    }

    handleApplyClick(applyButton);
  });
}

async function handleApplyClick(applyButton) {
  clearJobsMessage();

  if (!isLoggedIn()) {
    showJobsMessage("Please login as a student before applying.", "error");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 900);
    return;
  }

  const user = getAuthUser();

  if (user?.role !== "student") {
    showJobsMessage("Only student accounts can apply for jobs.", "error");
    return;
  }

  const payload = getApplicationPayload(applyButton.dataset.jobId);

  if (!payload.resume_link) {
    showJobsMessage("Please add a resume link before applying.", "error");
    return;
  }

  setApplyLoading(applyButton, true);

  try {
    const data = await postDataWithAuth("/applications", payload);
    showJobsMessage(data.message || "Application submitted successfully.", "success");
    markApplied(applyButton);
  } catch (error) {
    handleApplyError(error, applyButton);
  } finally {
    if (!applyButton.disabled || applyButton.dataset.applied !== "true") {
      setApplyLoading(applyButton, false);
    }
  }
}

function getApplicationPayload(jobId) {
  const resumeInput = document.querySelector(`[data-resume-for="${cssEscapeValue(jobId)}"]`);

  return {
    job_id: Number(jobId),
    resume_link: resumeInput?.value.trim() || "",
    cover_letter: null,
    // Future upload support can replace resume_link with an uploaded file URL.
  };
}

function setApplyLoading(applyButton, isLoading) {
  applyButton.disabled = isLoading;
  applyButton.textContent = isLoading ? "Applying..." : "Apply";
}

function markApplied(applyButton) {
  applyButton.dataset.applied = "true";
  applyButton.disabled = true;
  applyButton.textContent = "Applied";
  applyButton.classList.remove("btn-primary");
  applyButton.classList.add("btn-secondary");
}

function handleApplyError(error, applyButton) {
  if (error.status === 409) {
    showJobsMessage("You have already applied to this job.", "error");
    markApplied(applyButton);
    return;
  }

  if (error.status === 401) {
    showJobsMessage("Your session has expired. Please login again.", "error");
    clearAuthSession();
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 900);
    return;
  }

  if (error.status === 403) {
    showJobsMessage("Only student accounts can apply for jobs.", "error");
    return;
  }

  if (error.errors && error.errors.length > 0) {
    showJobsMessage(error.errors.join(". "), "error");
    return;
  }

  showJobsMessage(error.message || "Unable to submit application. Please try again.", "error");
}

function showJobsLoading() {
  if (!jobsContainer) {
    return;
  }

  jobsContainer.innerHTML = `
    <article class="card loading-card">
      <span class="loader" aria-hidden="true"></span>
      <p>Loading jobs...</p>
    </article>
  `;
}

function showJobsMessage(message, type) {
  if (!jobsMessage) {
    return;
  }

  jobsMessage.textContent = message;
  jobsMessage.className = `message message-${type}`;
}

function clearJobsMessage() {
  if (!jobsMessage) {
    return;
  }

  jobsMessage.textContent = "";
  jobsMessage.className = "message";
}

function formatSkills(skillsRequired) {
  if (!skillsRequired) {
    return ["Skills not specified"];
  }

  return String(skillsRequired)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function formatDate(value) {
  if (!value) {
    return "No deadline";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatText(value) {
  return String(value).replaceAll("_", " ");
}

function cssEscapeValue(value) {
  if (window.CSS && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return String(value).replaceAll('"', '\\"');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
