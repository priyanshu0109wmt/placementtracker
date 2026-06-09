const recruiterAnalyticsMessage = document.getElementById("recruiterAnalyticsMessage");
const recruiterAnalyticsFields = {
  total_jobs: document.getElementById("analyticsTotalJobs"),
  total_applications: document.getElementById("analyticsTotalApplications"),
  shortlisted: document.getElementById("analyticsShortlisted"),
  accepted: document.getElementById("analyticsAccepted"),
  rejected: document.getElementById("analyticsRejected"),
};

initRecruiterAnalytics();

function initRecruiterAnalytics() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadRecruiterAnalytics);
    return;
  }

  loadRecruiterAnalytics();
}

async function loadRecruiterAnalytics() {
  if (!canLoadRecruiterAnalytics()) {
    return;
  }

  setRecruiterAnalyticsLoading(true);
  clearRecruiterAnalyticsMessage();

  try {
    const data = await getDataWithAuth("/jobs/analytics");
    renderRecruiterAnalytics(data.analytics || {});
  } catch (error) {
    renderRecruiterAnalytics({});
    handleRecruiterAnalyticsError(error);
  }
}

function canLoadRecruiterAnalytics() {
  return isLoggedIn() && hasRequiredRole("recruiter");
}

function renderRecruiterAnalytics(analytics) {
  Object.keys(recruiterAnalyticsFields).forEach((key) => {
    const field = recruiterAnalyticsFields[key];

    if (!field) {
      return;
    }

    field.textContent = formatAnalyticsNumber(analytics[key] || 0);
  });
}

function setRecruiterAnalyticsLoading(isLoading) {
  Object.values(recruiterAnalyticsFields).forEach((field) => {
    if (field) {
      field.textContent = isLoading ? "..." : field.textContent;
    }
  });
}

function handleRecruiterAnalyticsError(error) {
  if (error.status === 401) {
    showRecruiterAnalyticsMessage("Your session has expired. Please login again.", "error");
    clearAuthSession();
    redirectToLogin(900);
    return;
  }

  if (error.status === 403) {
    showRecruiterAnalyticsMessage("Only recruiter accounts can view analytics.", "error");
    return;
  }

  showRecruiterAnalyticsMessage(error.message || "Unable to load analytics.", "error");
}

function showRecruiterAnalyticsMessage(message, type) {
  if (!recruiterAnalyticsMessage) {
    return;
  }

  recruiterAnalyticsMessage.textContent = message;
  recruiterAnalyticsMessage.className = `message message-${type}`;
}

function clearRecruiterAnalyticsMessage() {
  if (!recruiterAnalyticsMessage) {
    return;
  }

  recruiterAnalyticsMessage.textContent = "";
  recruiterAnalyticsMessage.className = "message";
}

function formatAnalyticsNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}
