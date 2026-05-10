const recruiterApplicantsContainer = document.getElementById("recruiterApplicantsContainer");
const recruiterApplicantsMessage = document.getElementById("recruiterApplicantsMessage");
const VALID_APPLICATION_STATUSES = ["shortlisted", "rejected", "accepted"];

function initRecruiterApplicants() {
  if (!canLoadRecruiterApplicants()) {
    return;
  }

  loadRecruiterApplicants();
  setupStatusActions();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRecruiterApplicants);
} else {
  initRecruiterApplicants();
}

function canLoadRecruiterApplicants() {
  return isLoggedIn() && hasRequiredRole("recruiter");
}

async function loadRecruiterApplicants() {
  showRecruiterApplicantsLoading();
  clearRecruiterApplicantsMessage();

  try {
    const jobsData = await getDataWithAuth("/jobs/my-jobs");
    const jobs = normalizeJobs(jobsData.jobs || []);

    if (!jobs.length) {
      renderRecruiterApplicants([]);
      return;
    }

    const applicantsByJob = await Promise.all(
      jobs.map((job) => getApplicantsForJob(job))
    );

    renderRecruiterApplicants(applicantsByJob.flat());
  } catch (error) {
    renderRecruiterApplicants([]);
    handleRecruiterApplicantsError(error);
  }
}

async function getApplicantsForJob(job) {
  const endpoint = `/jobs/${encodeURIComponent(job.id)}/applications`;
  const data = await getDataWithAuth(endpoint);
  const applications = data.applications || [];

  return applications.map((application) => ({
    ...application,
    job_title: application.job_title || job.title,
  }));
}

function normalizeJobs(jobs) {
  return jobs
    .map((job) => ({
      ...job,
      id: job.id ?? job.job_id,
    }))
    .filter((job) => {
      return Boolean(job.id);
    });
}

function renderRecruiterApplicants(applicants) {
  if (!recruiterApplicantsContainer) {
    return;
  }

  if (!applicants.length) {
    recruiterApplicantsContainer.innerHTML = `
      <article class="empty-state">
        <h2>No applicants yet</h2>
        <p>Student applications for your jobs will appear here.</p>
      </article>
    `;
    return;
  }

  recruiterApplicantsContainer.innerHTML = applicants.map(renderApplicantCard).join("");
}

function renderApplicantCard(applicant) {
  return `
    <article class="application-card" data-application-card="${escapeHtml(String(applicant.id || ""))}">
      <div class="application-card-header">
        <div>
          <h3>${escapeHtml(applicant.student_name || "Unnamed Student")}</h3>
          <p>${escapeHtml(applicant.student_email || "Email not available")}</p>
        </div>
        <span class="status-badge status-${escapeHtml(getStatusClass(applicant.status))}" data-status-badge>
          ${escapeHtml(formatStatus(applicant.status))}
        </span>
      </div>

      <dl class="application-meta">
        <div>
          <dt>Job</dt>
          <dd>${escapeHtml(applicant.job_title || "Untitled Job")}</dd>
        </div>
        <div>
          <dt>Applied On</dt>
          <dd>${escapeHtml(formatDate(applicant.applied_at))}</dd>
        </div>
      </dl>

      <div class="applicant-actions">
        ${renderResumeLink(applicant.resume_link)}
        ${renderStatusActions(applicant)}
      </div>
    </article>
  `;
}

function renderStatusActions(applicant) {
  const currentStatus = applicant.status || "applied";

  return `
    <div class="status-actions" data-application-id="${escapeHtml(String(applicant.id || ""))}">
      ${VALID_APPLICATION_STATUSES.map((status) => `
        <button
          class="btn btn-secondary btn-small status-action-button"
          type="button"
          data-status="${escapeHtml(status)}"
          ${currentStatus === status ? "disabled" : ""}
        >
          ${escapeHtml(getStatusButtonLabel(status))}
        </button>
      `).join("")}
    </div>
  `;
}

function setupStatusActions() {
  if (!recruiterApplicantsContainer) {
    return;
  }

  recruiterApplicantsContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".status-action-button");

    if (!button) {
      return;
    }

    handleStatusAction(button);
  });
}

async function handleStatusAction(button) {
  clearRecruiterApplicantsMessage();

  const status = button.dataset.status;
  const actions = button.closest(".status-actions");
  const applicationId = actions?.dataset.applicationId;

  if (!VALID_APPLICATION_STATUSES.includes(status)) {
    showRecruiterApplicantsMessage("Invalid application status selected.", "error");
    return;
  }

  if (!applicationId) {
    showRecruiterApplicantsMessage("Application id is missing.", "error");
    return;
  }

  let updatedStatus = null;

  setStatusActionsLoading(actions, true, button);

  try {
    const data = await putDataWithAuth(`/applications/${encodeURIComponent(applicationId)}/status`, {
      status,
    });

    updatedStatus = data.application?.status || status;
    showRecruiterApplicantsMessage(data.message || "Application status updated.", "success");
  } catch (error) {
    handleStatusUpdateError(error);
  } finally {
    setStatusActionsLoading(actions, false);

    if (updatedStatus) {
      updateApplicationCardStatus(applicationId, updatedStatus);
    }
  }
}

function setStatusActionsLoading(actions, isLoading, activeButton = null) {
  if (!actions) {
    return;
  }

  const buttons = actions.querySelectorAll(".status-action-button");

  buttons.forEach((button) => {
    button.disabled = isLoading;

    if (isLoading && button === activeButton) {
      button.dataset.originalText = button.textContent;
      button.textContent = "Updating...";
    }

    if (!isLoading && button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  });
}

function updateApplicationCardStatus(applicationId, status) {
  const card = document.querySelector(`[data-application-card="${cssEscapeValue(applicationId)}"]`);

  if (!card) {
    return;
  }

  const badge = card.querySelector("[data-status-badge]");
  const actions = card.querySelector(".status-actions");

  if (badge) {
    badge.className = `status-badge status-${getStatusClass(status)}`;
    badge.textContent = formatStatus(status);
  }

  if (actions) {
    actions.querySelectorAll(".status-action-button").forEach((button) => {
      button.disabled = button.dataset.status === status;
    });
  }
}

function handleStatusUpdateError(error) {
  if (error.status === 401) {
    showRecruiterApplicantsMessage("Your session has expired. Please login again.", "error");
    clearAuthSession();
    redirectToLogin(900);
    return;
  }

  if (error.status === 403) {
    showRecruiterApplicantsMessage("You can only update applications for your own jobs.", "error");
    return;
  }

  if (error.errors && error.errors.length > 0) {
    showRecruiterApplicantsMessage(error.errors.join(". "), "error");
    return;
  }

  showRecruiterApplicantsMessage(error.message || "Unable to update application status.", "error");
}

function renderResumeLink(resumeLink) {
  if (!resumeLink) {
    return `<span class="muted-text">No resume link provided</span>`;
  }

  return `
    <a class="btn btn-secondary btn-small" href="${escapeHtml(resumeLink)}" target="_blank" rel="noopener noreferrer">
      View Resume
    </a>
  `;
}

function showRecruiterApplicantsLoading() {
  if (!recruiterApplicantsContainer) {
    return;
  }

  recruiterApplicantsContainer.innerHTML = `
    <article class="card loading-card">
      <span class="loader" aria-hidden="true"></span>
      <p>Loading applicants...</p>
    </article>
  `;
}

function handleRecruiterApplicantsError(error) {
  if (error.status === 401) {
    showRecruiterApplicantsMessage("Your session has expired. Please login again.", "error");
    clearAuthSession();
    redirectToLogin(900);
    return;
  }

  if (error.status === 403) {
    showRecruiterApplicantsMessage("Only recruiter accounts can view applicants.", "error");
    redirectUnauthorizedUser();
    return;
  }

  showRecruiterApplicantsMessage(error.message || "Unable to load applicants. Please try again.", "error");
}

function showRecruiterApplicantsMessage(message, type) {
  if (!recruiterApplicantsMessage) {
    return;
  }

  recruiterApplicantsMessage.textContent = message;
  recruiterApplicantsMessage.className = `message message-${type}`;
}

function clearRecruiterApplicantsMessage() {
  if (!recruiterApplicantsMessage) {
    return;
  }

  recruiterApplicantsMessage.textContent = "";
  recruiterApplicantsMessage.className = "message";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
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

function formatStatus(status) {
  return String(status || "pending").replaceAll("_", " ");
}

function getStatusClass(status) {
  return String(status || "pending").toLowerCase().replaceAll("_", "-");
}

function getStatusButtonLabel(status) {
  const labels = {
    shortlisted: "Shortlist",
    rejected: "Reject",
    accepted: "Accept",
  };

  return labels[status] || status;
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
