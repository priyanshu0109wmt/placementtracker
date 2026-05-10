document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form:not(#registerForm):not(#loginForm):not(#createJobForm)");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  });
});
