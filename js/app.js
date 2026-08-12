import * as store from "./store.js";
import { start } from "./router.js";
import { t } from "./i18n.js";
import { initInstallPrompt } from "./pwa-install.js";

window.__AC_BOOTED__ = false;

store.boot();

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!/^https?:$/.test(window.location.protocol)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("[sw] registration failed", err);
    });
  });
}

function renderFallbackIfNeeded() {
  const check = () => {
    if (window.__AC_BOOTED__) return;
    const view = document.getElementById("view");
    if (view && view.dataset.route === undefined) {
      view.innerHTML = `
        <div class="view view-pad view-center">
          <div class="state state-error" role="alert">
            <div class="error-icon">⚠</div>
            <h2>${escapeHtml(t("states.error"))}</h2>
            <p class="error-message">ES modules need a local HTTP server. Run <code>npx serve</code> inside <code>app/</code> (or <code>python -m http.server</code>) and open the printed URL.</p>
          </div>
        </div>
      `;
    }
  };
  window.addEventListener("load", () => setTimeout(check, 400));
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

registerServiceWorker();
renderFallbackIfNeeded();
initInstallPrompt();
start();
window.__AC_BOOTED__ = true;
