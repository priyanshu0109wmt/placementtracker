const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

redirectIfAlreadyLoggedIn();

if (loginForm) {
  loginForm.addEventListener("submit", handleLoginSubmit);
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearLoginMessage();
  setLoginLoading(true);

  const formData = new FormData(loginForm);
  const payload = {
    email: formData.get("email").trim(),
    password: formData.get("password"),
  };

  try {
    const data = await postData("/auth/login", payload);

    if (!data.token) {
      throw new Error("Login succeeded, but no token was returned by the server.");
    }

    saveAuthSession({
      token: data.token,
      user: data.user,
    });

    showLoginMessage(data.message || "Login successful. Redirecting...", "success");
    redirectToDashboard(data.user?.role, 700);
  } catch (error) {
    showLoginMessage(getLoginErrorMessage(error), "error");
  } finally {
    setLoginLoading(false);
  }
}

function redirectIfAlreadyLoggedIn() {
  if (!isLoggedIn()) {
    return;
  }

  const user = getAuthUser();
  redirectToDashboard(user?.role);
}

function setLoginLoading(isLoading) {
  loginButton.disabled = isLoading;
  loginButton.textContent = isLoading ? "Logging In..." : "Login";
}

function showLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = `message message-${type}`;
}

function clearLoginMessage() {
  loginMessage.textContent = "";
  loginMessage.className = "message";
}

function getLoginErrorMessage(error) {
  if (error.status === 401) {
    return "Invalid email or password.";
  }

  if (error.errors && error.errors.length > 0) {
    return error.errors.join(". ");
  }

  return error.message || "Login failed. Please try again.";
}
