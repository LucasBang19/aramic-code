import { t } from "../i18n.js";
import * as auth from "../auth.js";
import { navigate } from "../router.js";
import { logoMark, escapeHtml, toast } from "../ui.js";

export function renderCreateUser(container) {
  container.innerHTML = `
    <div class="view-center login-page">
      <div class="login-card">
        <div class="login-header">
          ${logoMark(72)}
          <h1 class="login-title">${escapeHtml(t("auth.createAccount"))}</h1>
          <div class="fleuron" aria-hidden="true"><span>✦</span><span>◆</span><span>✦</span></div>
          <p class="login-sub">${escapeHtml(t("auth.signupSubtitle"))}</p>
        </div>

        <form class="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="create-user-email">${escapeHtml(t("auth.email"))}</label>
            <input class="form-input" type="text" id="create-user-email" name="email"
              autocomplete="email" required
              placeholder="${escapeHtml(t("auth.emailPlaceholder"))}" />
            <p class="form-hint" data-error-email hidden></p>
          </div>

          <div class="form-group">
            <label class="form-label" for="create-user-password">${escapeHtml(t("auth.password"))}</label>
            <input class="form-input" type="password" id="create-user-password" name="password"
              autocomplete="new-password" required
              placeholder="${escapeHtml(t("auth.passwordPlaceholder"))}" />
            <p class="form-hint" data-error-password hidden></p>
          </div>

          <div class="login-error" data-error-box role="alert" hidden></div>

          <button class="btn btn-primary btn-block" type="submit" data-submit>
            <span data-submit-label>${escapeHtml(t("auth.signupSubmit"))}</span>
          </button>
        </form>

        <p class="login-switch">
          <a class="link-primary" href="/login">${escapeHtml(t("auth.switchToLogin"))}</a>
        </p>
      </div>
    </div>
  `;

  const form = container.querySelector(".login-form");
  const submitBtn = container.querySelector("[data-submit]");
  const submitLabel = container.querySelector("[data-submit-label]");
  const errorBox = container.querySelector("[data-error-box]");
  const emailInput = container.querySelector("#create-user-email");
  const passwordInput = container.querySelector("#create-user-password");

  function clearErrors() {
    errorBox.hidden = true;
    container.querySelectorAll(".form-hint").forEach((hint) => (hint.hidden = true));
    container.querySelectorAll(".form-input").forEach((input) => input.classList.remove("error"));
  }

  function showFieldError(name, message) {
    const input = name === "email" ? emailInput : passwordInput;
    const hint = container.querySelector(`[data-error-${name}]`);
    input.classList.add("error");
    if (hint) {
      hint.textContent = message;
      hint.hidden = false;
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let valid = true;
    if (!email) {
      showFieldError("email", t("auth.required"));
      valid = false;
    }
    if (!password) {
      showFieldError("password", t("auth.required"));
      valid = false;
    }
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    submitLabel.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span>`;
    let result;
    try {
      result = await auth.register(email, password);
    } catch (error) {
      console.error("[auth] signup request failed", error);
      result = { ok: false, error: "database" };
    }

    if (result.ok) {
      toast(t("auth.welcome"));
      navigate("home");
      return;
    }

    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
    submitLabel.textContent = t("auth.signupSubmit");
    const message =
      result.error === "exists"
        ? t("auth.accountExists")
        : result.error === "providerDisabled"
          ? t("auth.providerDisabled")
          : result.error === "confirmEmail"
            ? t("auth.confirmEmail")
            : t("auth.databaseError");
    errorBox.textContent = message;
    errorBox.hidden = false;
  });

  emailInput.addEventListener("input", clearErrors);
  passwordInput.addEventListener("input", clearErrors);
  return container;
}
