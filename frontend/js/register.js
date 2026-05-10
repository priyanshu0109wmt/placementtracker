const registerForm = document.getElementById("registerForm");
const registerButton = document.getElementById("registerButton");
const registerMessage = document.getElementById("registerMessage");

if (registerForm) {
  registerForm.addEventListener("submit", handleRegisterSubmit);
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearMessage();
  setLoading(true);

  const formData = new FormData(registerForm);
  const payload = {
    full_name: formData.get("full_name").trim(),
    email: formData.get("email").trim(),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  try {
    const data = await postData("/auth/register", payload);

    if (!data.token) {
      throw new Error("Registration succeeded, but no token was returned by the server.");
    }

    saveAuthSession({
      token: data.token,
      user: data.user,
    });

    showMessage(data.message || "Registration successful. Redirecting...", "success");
    redirectByRole(data.user?.role || payload.role);
  } catch (error) {
    showMessage(getRegisterErrorMessage(error), "error");
  } finally {
    setLoading(false);
  }
}

function redirectByRole(role) {
  redirectToDashboard(role, 700);
}

function setLoading(isLoading) {
  registerButton.disabled = isLoading;
  registerButton.textContent = isLoading ? "Creating Account..." : "Register";
}

function showMessage(message, type) {
  registerMessage.textContent = message;
  registerMessage.className = `message message-${type}`;
}

function clearMessage() {
  registerMessage.textContent = "";
  registerMessage.className = "message";
}

function getRegisterErrorMessage(error) {
  if (error.errors && error.errors.length > 0) {
    return error.errors.join(". ");
  }

  return error.message || "Registration failed. Please try again.";
}
