import { t } from "../i18n.js";
import * as auth from "../auth.js";
import { navigate } from "../router.js";
import { logoMark, escapeHtml, toast } from "../ui.js";

export function renderLogin(container) {
  let mode = "login";

  function render() {
    const isSignup = mode === "signup";
    const title = isSignup ? t("auth.createAccount") : t("auth.enter");
    const subtitle = isSignup ? t("auth.signupSubtitle") : t("auth.subtitle");
    const submit = isSignup ? t("auth.signupSubmit") : t("auth.submit");
    const switchLabel = isSignup ? t("auth.switchToLogin") : t("auth.switchToSignup");

    container.innerHTML = `
      <div class="view-center login-page">
        <div class="login-card">
          <div class="login-header">
            ${logoMark(72)}
            <h1 class="login-title">${escapeHtml(title)}</h1>
            <div class="fleuron" aria-hidden="true"><span>✦</span><span>◆</span><span>✦</span></div>
            <p class="login-sub">${escapeHtml(subtitle)}</p>
          </div>

          <form class="login-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="login-email">${escapeHtml(t("auth.email"))}</label>
              <input class="form-input" type="text" id="login-email" name="email"
                autocomplete="username" required
                placeholder="${escapeHtml(t("auth.emailPlaceholder"))}" />
              <p class="form-hint" data-error-email hidden></p>
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">${escapeHtml(t("auth.password"))}</label>
              <input class="form-input" type="password" id="login-password" name="password"
                autocomplete="current-password" required
                placeholder="${escapeHtml(t("auth.passwordPlaceholder"))}" />
              <p class="form-hint" data-error-password hidden></p>
            </div>

            <div class="login-error" data-error-box role="alert" hidden></div>

            <button class="btn btn-primary btn-block" type="submit" data-submit>
              <span data-submit-label>${escapeHtml(submit)}</span>
            </button>
          </form>

          <p class="login-switch">
            <button class="link-primary" type="button" data-toggle-mode>${escapeHtml(switchLabel)}</button>
          </p>
        </div>
      </div>
    `;

    bind();
  }

  function bind() {
    const form = container.querySelector(".login-form");
    const submitBtn = container.querySelector("[data-submit]");
    const submitLabel = container.querySelector("[data-submit-label]");
    const errorBox = container.querySelector("[data-error-box]");
    const emailInput = container.querySelector("#login-email");
    const passwordInput = container.querySelector("#login-password");

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

    function setLoading(loading) {
      submitBtn.disabled = loading;
      submitBtn.classList.toggle("loading", loading);
      submitLabel.textContent = loading ? "" : (mode === "signup" ? t("auth.signupSubmit") : t("auth.submit"));
      if (loading) submitLabel.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span>`;
    }

    form.addEventListener("submit", (event) => {
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

      setLoading(true);
      setTimeout(() => {
        const result = mode === "signup" ? auth.register(email, password) : auth.login(email, password);
        if (result.ok) {
          toast(t("auth.welcome"));
          navigate("home");
        } else {
          setLoading(false);
          errorBox.textContent = result.error === "exists" ? t("auth.accountExists") : t("auth.wrongCreds");
          errorBox.hidden = false;
        }
      }, 250);
    });

    emailInput.addEventListener("input", clearErrors);
    passwordInput.addEventListener("input", clearErrors);
    container.querySelector("[data-toggle-mode]").addEventListener("click", () => {
      mode = mode === "login" ? "signup" : "login";
      render();
    });
  }

  render();
  return container;
}
