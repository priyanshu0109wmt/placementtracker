document.addEventListener("DOMContentLoaded", () => {
  if (!protectDashboard()) {
    return;
  }

  showDashboardUser();
  setupLogout();
});

function protectDashboard() {
  const requiredRole = document.body.dataset.requiredRole;

  if (!isLoggedIn()) {
    redirectToLogin();
    return false;
  }

  if (!hasRequiredRole(requiredRole)) {
    redirectUnauthorizedUser();
    return false;
  }

  return true;
}

function showDashboardUser() {
  const user = getAuthUser();

  if (!user) {
    return;
  }

  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");
  const userEmail = document.getElementById("userEmail");

  if (userName) {
    userName.textContent = user.full_name || "User";
  }

  if (userRole) {
    userRole.textContent = user.role || "user";
  }

  if (userEmail) {
    userEmail.textContent = user.email || "No email available";
  }
}

function setupLogout() {
  const logoutButton = document.getElementById("logoutButton");

  if (!logoutButton) {
    return;
  }

  logoutButton.addEventListener("click", () => {
    logout();
  });
}
