const applicationsContainer = document.getElementById("applicationsContainer");
const applicationsMessage = document.getElementById("applicationsMessage");

document.addEventListener("DOMContentLoaded", () => {
  if (!canLoadStudentApplications()) {
    return;
  }

  loadStudentApplications();
});

function canLoadStudentApplications() {
  return isLoggedIn() && hasRequiredRole("student");
}

async function loadStudentApplications() {
  showApplicationsLoading();
  clearApplicationsMessage();

  try {
    const data = await getDataWithAuth("/applications/my-applications");
    renderApplications(data.applications || []);
  } catch (error) {
    renderApplications([]);
    handleApplicationsError(error);
  }
}

function renderApplications(applications) {
  if (!applicationsContainer) {
    return;
  }

  if (!applications.length) {
    applicationsContainer.innerHTML = `
      <article class="empty-state applications-empty-state">
        <span class="empty-state-mark" aria-hidden="true"></span>
        <h2>No applications yet</h2>
        <p>Jobs you apply to will appear here with their latest status.</p>
      </article>
    `;
    return;
  }

  applicationsContainer.innerHTML = applications.map(renderApplicationCard).join("");
}

function renderApplicationCard(application) {
  const status = application.status || "pending";

  return `
    <article class="application-card student-application-card">
      <div class="application-card-header">
        <div>
          <span class="application-company">${escapeHtml(application.company_name || "Company not specified")}</span>
          <h3>${escapeHtml(application.title || "Untitled Job")}</h3>
        </div>
        <span class="status-badge status-${escapeHtml(getStatusClass(status))}">
          ${escapeHtml(formatStatus(status))}
        </span>
      </div>

      <dl class="application-meta">
        <div>
          <dt>Applied On</dt>
          <dd>${escapeHtml(formatDate(application.applied_at))}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>${escapeHtml(formatStatus(status))}</dd>
        </div>
      </dl>
    </article>
  `;
}

function showApplicationsLoading() {
  if (!applicationsContainer) {
    return;
  }

  applicationsContainer.innerHTML = `
    <article class="card loading-card">
      <span class="loader" aria-hidden="true"></span>
      <p>Loading applications...</p>
    </article>
  `;
}

function handleApplicationsError(error) {
  if (error.status === 401) {
    showApplicationsMessage("Your session has expired. Please login again.", "error");
    clearAuthSession();
    redirectToLogin(900);
    return;
  }

  if (error.status === 403) {
    showApplicationsMessage("Only student accounts can view applications.", "error");
    redirectUnauthorizedUser();
    return;
  }

  showApplicationsMessage(error.message || "Unable to load applications. Please try again.", "error");
}

function showApplicationsMessage(message, type) {
  if (!applicationsMessage) {
    return;
  }

  applicationsMessage.textContent = message;
  applicationsMessage.className = `message message-${type}`;
}

function clearApplicationsMessage() {
  if (!applicationsMessage) {
    return;
  }

  applicationsMessage.textContent = "";
  applicationsMessage.className = "message";
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
