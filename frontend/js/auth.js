const AUTH_TOKEN_KEY = "plctr_auth_token";
const AUTH_USER_KEY = "plctr_auth_user";

function saveAuthToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

function isLoggedIn() {
  return Boolean(getAuthToken());
}

function saveAuthUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function getAuthUser() {
  const user = localStorage.getItem(AUTH_USER_KEY);
  return user ? JSON.parse(user) : null;
}

function clearAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

function saveAuthSession({ token, user }) {
  saveAuthToken(token);

  if (user) {
    saveAuthUser(user);
  }
}

function clearAuthSession() {
  clearAuthToken();
  clearAuthUser();
}

function getCurrentUserRole() {
  const user = getAuthUser();
  return user?.role || null;
}

function hasRequiredRole(requiredRole) {
  if (!requiredRole) {
    return true;
  }

  return getCurrentUserRole() === requiredRole;
}

function getDashboardPath(role) {
  const dashboards = {
    student: "./student-dashboard.html",
    recruiter: "./recruiter-dashboard.html",
  };

  return dashboards[role] || "./login.html";
}

function redirectToDashboard(role, delay = 0) {
  const redirect = () => {
    window.location.href = getDashboardPath(role);
  };

  if (delay > 0) {
    setTimeout(redirect, delay);
    return;
  }

  redirect();
}

function redirectToLogin(delay = 0) {
  const redirect = () => {
    window.location.href = "./login.html";
  };

  if (delay > 0) {
    setTimeout(redirect, delay);
    return;
  }

  redirect();
}

function logout() {
  clearAuthSession();
  redirectToLogin();
}

function redirectUnauthorizedUser() {
  clearAuthSession();
  redirectToLogin();
}
