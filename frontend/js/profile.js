const profileForm = document.getElementById("profileForm");
const profileMessage = document.getElementById("profileMessage");
const profileSaveButton = document.getElementById("profileSaveButton");
let studentProfileExists = false;

initStudentProfile();

function initStudentProfile() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupStudentProfile);
    return;
  }

  setupStudentProfile();
}

function setupStudentProfile() {
  if (!profileForm) {
    return;
  }

  if (!canManageStudentProfile()) {
    redirectUnauthorizedUser();
    return;
  }

  profileForm.addEventListener("submit", handleProfileSubmit);
  loadStudentProfile();
}

function canManageStudentProfile() {
  return isLoggedIn() && hasRequiredRole("student");
}

async function loadStudentProfile() {
  clearProfileMessage();
  setProfileLoading(true, "Loading...");

  try {
    const data = await getDataWithAuth("/students/profile");
    studentProfileExists = Boolean(data.profile);
    populateProfileForm(data.profile || {});
  } catch (error) {
    if (error.status === 404) {
      studentProfileExists = false;
      clearProfileForm();
      showProfileMessage("Create your profile to save your placement details.", "success");
      return;
    }

    handleProfileError(error);
  } finally {
    setProfileLoading(false);
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  clearProfileMessage();

  const payload = getProfilePayload();
  const errors = validateProfilePayload(payload);

  if (errors.length > 0) {
    showProfileMessage(errors.join(". "), "error");
    return;
  }

  setProfileLoading(true, studentProfileExists ? "Updating..." : "Saving...");

  try {
    const data = studentProfileExists
      ? await putDataWithAuth("/students/profile", payload)
      : await postDataWithAuth("/students/profile", payload);

    studentProfileExists = true;
    populateProfileForm(data.profile || payload);
    showProfileMessage(data.message || "Profile saved successfully.", "success");
  } catch (error) {
    handleProfileError(error);
  } finally {
    setProfileLoading(false);
  }
}

function getProfilePayload() {
  const formData = new FormData(profileForm);

  return {
    college_name: String(formData.get("college_name") || "").trim(),
    branch: String(formData.get("branch") || "").trim(),
    graduation_year: String(formData.get("graduation_year") || "").trim(),
    skills: String(formData.get("skills") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    linkedin_url: String(formData.get("linkedin_url") || "").trim(),
    github_url: String(formData.get("github_url") || "").trim(),
    bio: String(formData.get("bio") || "").trim(),
  };
}

function validateProfilePayload(payload) {
  const errors = [];
  const graduationYear = Number(payload.graduation_year);
  const currentYear = new Date().getFullYear();

  if (payload.college_name.length < 2) {
    errors.push("College name must be at least 2 characters long");
  }

  if (payload.branch.length < 2) {
    errors.push("Branch must be at least 2 characters long");
  }

  if (
    !Number.isInteger(graduationYear)
    || graduationYear < currentYear - 10
    || graduationYear > currentYear + 10
  ) {
    errors.push("Graduation year must be a valid year");
  }

  if (payload.phone.length > 20) {
    errors.push("Phone must not exceed 20 characters");
  }

  if (payload.linkedin_url && !isValidProfileUrl(payload.linkedin_url)) {
    errors.push("LinkedIn URL must be a valid http or https URL");
  }

  if (payload.github_url && !isValidProfileUrl(payload.github_url)) {
    errors.push("GitHub URL must be a valid http or https URL");
  }

  if (payload.bio.length > 1000) {
    errors.push("Bio must not exceed 1000 characters");
  }

  return errors;
}

function populateProfileForm(profile) {
  profileForm.elements.college_name.value = profile.college_name || "";
  profileForm.elements.branch.value = profile.branch || "";
  profileForm.elements.graduation_year.value = profile.graduation_year || "";
  profileForm.elements.skills.value = profile.skills || "";
  profileForm.elements.phone.value = profile.phone || "";
  profileForm.elements.linkedin_url.value = profile.linkedin_url || "";
  profileForm.elements.github_url.value = profile.github_url || "";
  profileForm.elements.bio.value = profile.bio || "";
}

function clearProfileForm() {
  profileForm.reset();
}

function setProfileLoading(isLoading, loadingText = "Saving...") {
  if (!profileSaveButton) {
    return;
  }

  profileSaveButton.disabled = isLoading;
  profileSaveButton.textContent = isLoading ? loadingText : "Save Profile";
}

function handleProfileError(error) {
  if (error.status === 401) {
    showProfileMessage("Your session has expired. Please login again.", "error");
    clearAuthSession();
    redirectToLogin(900);
    return;
  }

  if (error.status === 403) {
    showProfileMessage("Only student accounts can manage this profile.", "error");
    redirectUnauthorizedUser();
    return;
  }

  if (error.errors && error.errors.length > 0) {
    showProfileMessage(error.errors.join(". "), "error");
    return;
  }

  showProfileMessage(error.message || "Unable to save profile. Please try again.", "error");
}

function showProfileMessage(message, type) {
  if (!profileMessage) {
    return;
  }

  profileMessage.textContent = message;
  profileMessage.className = `message message-${type}`;
}

function clearProfileMessage() {
  if (!profileMessage) {
    return;
  }

  profileMessage.textContent = "";
  profileMessage.className = "message";
}

function isValidProfileUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}
