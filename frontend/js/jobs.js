const jobsContainer = document.getElementById("jobsContainer");
const jobsMessage = document.getElementById("jobsMessage");
const jobSearchInput = document.getElementById("jobSearchInput");
const locationFilter = document.getElementById("locationFilter");
const jobTypeFilter = document.getElementById("jobTypeFilter");
const jobsResultCount = document.getElementById("jobsResultCount");
let allJobs = [];

document.addEventListener("DOMContentLoaded", () => {
  setupJobFilters();
  loadJobs();
  setupApplyButtons();
});

async function loadJobs() {
  showJobsLoading();
  clearJobsMessage();

  try {
    const data = await getData("/jobs");
    allJobs = data.jobs || [];
    populateJobFilters(allJobs);
    applyJobFilters();
  } catch (error) {
    allJobs = [];
    updateJobsResultCount(0, 0);
    renderJobs([]);
    showJobsMessage(error.message || "Unable to load jobs. Please try again.", "error");
  }
}

function renderJobs(
  jobs,
  emptyMessage = "New placement opportunities will appear here when recruiters post them.",
  emptyTitle = "No jobs available"
) {
  if (!jobsContainer) {
    return;
  }

  if (!jobs.length) {
    jobsContainer.innerHTML = `
      <article class="empty-state jobs-empty-state">
        <span class="empty-state-mark" aria-hidden="true"></span>
        <h2>${escapeHtml(emptyTitle)}</h2>
        <p>${escapeHtml(emptyMessage)}</p>
      </article>
    `;
    return;
  }

  jobsContainer.innerHTML = jobs.map(renderJobCard).join("");
}

function setupJobFilters() {
  [jobSearchInput, locationFilter, jobTypeFilter].forEach((control) => {
    if (!control) {
      return;
    }

    control.addEventListener("input", applyJobFilters);
    control.addEventListener("change", applyJobFilters);
  });
}

function populateJobFilters(jobs) {
  populateSelectOptions(locationFilter, getUniqueValues(jobs, "location"), "All locations");
  populateSelectOptions(jobTypeFilter, getUniqueValues(jobs, "job_type"), "All types", formatText);
}

function populateSelectOptions(selectElement, values, defaultLabel, formatter = (value) => value) {
  if (!selectElement) {
    return;
  }

  const selectedValue = selectElement.value;
  selectElement.innerHTML = `<option value="">${escapeHtml(defaultLabel)}</option>`;

  values.forEach((value) => {
    selectElement.innerHTML += `
      <option value="${escapeHtml(value)}">${escapeHtml(formatter(value))}</option>
    `;
  });

  if (values.includes(selectedValue)) {
    selectElement.value = selectedValue;
  }
}

function getUniqueValues(jobs, key) {
  return [...new Set(
    jobs
      .map((job) => String(job[key] || "").trim())
      .filter(Boolean)
  )].sort((first, second) => first.localeCompare(second));
}

function applyJobFilters() {
  const searchTerm = normalizeFilterValue(jobSearchInput?.value || "");
  const selectedLocation = normalizeFilterValue(locationFilter?.value || "");
  const selectedJobType = normalizeFilterValue(jobTypeFilter?.value || "");

  const filteredJobs = allJobs.filter((job) => {
    const title = normalizeFilterValue(job.title || "");
    const companyName = normalizeFilterValue(job.company_name || "");
    const location = normalizeFilterValue(job.location || "");
    const jobType = normalizeFilterValue(job.job_type || "");

    const matchesSearch = !searchTerm || title.includes(searchTerm) || companyName.includes(searchTerm);
    const matchesLocation = !selectedLocation || location === selectedLocation;
    const matchesJobType = !selectedJobType || jobType === selectedJobType;

    return matchesSearch && matchesLocation && matchesJobType;
  });

  updateJobsResultCount(filteredJobs.length, allJobs.length);
  renderJobs(
    filteredJobs,
    allJobs.length ? "Try a different search or filter combination." : undefined,
    allJobs.length ? "No matching jobs" : undefined
  );
}

function normalizeFilterValue(value) {
  return String(value).trim().toLowerCase();
}

function updateJobsResultCount(visibleCount, totalCount) {
  if (!jobsResultCount) {
    return;
  }

  if (!totalCount) {
    jobsResultCount.textContent = "No jobs posted yet";
    return;
  }

  jobsResultCount.textContent = `Showing ${visibleCount} of ${totalCount} ${totalCount === 1 ? "job" : "jobs"}`;
}

function renderJobCard(job) {
  const skills = formatSkills(job.skills_required);

  return `
    <article class="job-card">
      <div class="job-card-header">
        <div>
          <span class="job-company">${escapeHtml(job.company_name || "Company not specified")}</span>
          <h2>${escapeHtml(job.title || "Untitled Job")}</h2>
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
        <div class="application-controls-heading">
          <label for="resumeFile-${escapeHtml(String(job.id || ""))}">Resume PDF</label>
          <span>Max 5MB</span>
        </div>
        <input
          id="resumeFile-${escapeHtml(String(job.id || ""))}"
          class="resume-file-input"
          type="file"
          accept="application/pdf,.pdf"
          data-resume-for="${escapeHtml(String(job.id || ""))}"
        >
        <span class="selected-file-name" data-file-name-for="${escapeHtml(String(job.id || ""))}">
          No PDF selected
        </span>
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

  jobsContainer.addEventListener("change", (event) => {
    const resumeInput = event.target.closest(".resume-file-input");

    if (!resumeInput) {
      return;
    }

    handleResumeFileSelection(resumeInput);
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
  const errors = validateApplicationPayload(payload);

  if (errors.length > 0) {
    showJobsMessage(errors.join(". "), "error");
    return;
  }

  setApplyLoading(applyButton, true);

  try {
    const data = await postFormDataWithAuth("/applications", payload.formData);
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
  const resumeFile = resumeInput?.files?.[0] || null;
  const formData = new FormData();

  formData.append("job_id", jobId);

  if (resumeFile) {
    formData.append("resume", resumeFile);
  }

  return {
    jobId: Number(jobId),
    resumeFile,
    formData,
  };
}

function validateApplicationPayload(payload) {
  const errors = [];
  const maxResumeSize = 5 * 1024 * 1024;

  if (!payload.jobId) {
    errors.push("Job id is missing");
  }

  if (!payload.resumeFile) {
    errors.push("Please choose a PDF resume before applying");
    return errors;
  }

  const isPdf = payload.resumeFile.type === "application/pdf" || payload.resumeFile.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    errors.push("Resume must be a PDF file");
  }

  if (payload.resumeFile.size > maxResumeSize) {
    errors.push("Resume PDF must be 5MB or smaller");
  }

  return errors;
}

function handleResumeFileSelection(input) {
  const jobId = input.dataset.resumeFor;
  const fileNameLabel = document.querySelector(`[data-file-name-for="${cssEscapeValue(jobId)}"]`);
  const file = input.files?.[0];

  if (!fileNameLabel) {
    return;
  }

  if (!file) {
    fileNameLabel.textContent = "No PDF selected";
    fileNameLabel.classList.remove("file-error");
    return;
  }

  const errors = validateApplicationPayload({
    jobId: Number(jobId),
    resumeFile: file,
    formData: new FormData(),
  });

  fileNameLabel.textContent = file.name;
  fileNameLabel.classList.toggle("file-error", errors.length > 0);

  if (errors.length > 0) {
    showJobsMessage(errors.join(". "), "error");
  } else {
    clearJobsMessage();
  }
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
