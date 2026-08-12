import { t } from "./i18n.js";
import { getLanguage } from "./store.js";
import { el, escapeHtml, svgIcon } from "./ui.js";

const LS_KEY = "ac_pwa_install_v1";
const NAG_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 2500;

const SHARE_GLYPH =
  '<svg class="pwa-share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 3v11"/><path d="M7 8l5-5 5 5"/></svg>';

let deferredPrompt = null;
let node = null;
let shown = false;

function lang() {
  return getLanguage();
}

function isStandalone() {
  return (
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  const ua = navigator.userAgent || "";
  if (/iP(ad|hone|od)/.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isMobile() {
  return (
    window.innerWidth <= 768 ||
    (window.matchMedia && matchMedia("(pointer: coarse)").matches)
  );
}

function readState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function writeState(patch) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ...(readState() || {}), ...patch }));
  } catch (err) {
    /* storage unavailable — skip silently */
  }
}

function shouldShow() {
  const state = readState() || {};
  if (state.installed) return false;
  if (state.dismissedAt) return Date.now() - state.dismissedAt >= NAG_MS;
  return true;
}

function sheetMarkup(mode) {
  const iosBlock =
    mode === "ios"
      ? `<div class="pwa-install-ios" role="note">
           <p>${t("pwa.install.iosInstructions", lang()).replace("{share}", SHARE_GLYPH)}</p>
         </div>`
      : "";
  return `
    <div class="pwa-install-backdrop">
      <div class="pwa-install-sheet" role="dialog" aria-modal="true" aria-label="${escapeHtml(t("pwa.install.title", lang()))}">
        <button type="button" class="pwa-install-close" data-pwa-dismiss aria-label="${escapeHtml(t("common.close", lang()))}">×</button>
        <div class="pwa-install-icon" aria-hidden="true">
          <svg class="pwa-install-logo" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="32" cy="32" r="30" opacity="0.8"/>
            <polygon points="32,14 45,44 19,44"/>
            <polygon points="32,50 45,20 19,20"/>
          </svg>
        </div>
        <h3 class="pwa-install-title">${escapeHtml(t("pwa.install.title", lang()))}</h3>
        <p class="pwa-install-text">${escapeHtml(t("pwa.install.subtitle", lang()))}</p>
        ${iosBlock}
        <div class="pwa-install-actions">
          <button type="button" class="btn btn-secondary" data-pwa-dismiss>${escapeHtml(t("pwa.install.later", lang()))}</button>
          ${mode === "android" ? `<button type="button" class="btn btn-primary" data-pwa-install>${escapeHtml(t("pwa.install.install", lang()))}</button>` : ""}
        </div>
      </div>
    </div>`;
}

function chipMarkup() {
  return `
    <div class="pwa-install-chip">
      <button type="button" class="pwa-install-chip-main" data-pwa-install>
        ${svgIcon("download", "icon icon-sm")}
        ${escapeHtml(t("pwa.install.chip", lang()))}
      </button>
      <button type="button" class="pwa-install-chip-close" data-pwa-dismiss aria-label="${escapeHtml(t("common.close", lang()))}">×</button>
    </div>`;
}

function schedule(mode) {
  if (shown) return;
  const fire = () => {
    if (!shown) setTimeout(() => maybeShow(mode), SHOW_DELAY_MS);
  };
  if (document.readyState === "complete") fire();
  else window.addEventListener("load", fire, { once: true });
}

function maybeShow(mode) {
  if (shown || isStandalone() || !shouldShow()) return;
  if (mode === "android" && !deferredPrompt) return;
  show(mode);
}

function show(mode) {
  shown = true;
  if (isMobile()) showSheet(mode);
  else showChip();
}

function showSheet(mode) {
  node = el(sheetMarkup(mode));
  document.body.appendChild(node);
  document.body.classList.add("pwa-install-open");

  node.addEventListener("click", (event) => {
    if (event.target.closest("[data-pwa-dismiss]")) dismiss();
    else if (event.target.closest("[data-pwa-install]")) install();
    else if (event.target.classList.contains("pwa-install-backdrop")) dismiss();
  });
}

function showChip() {
  node = el(chipMarkup());
  document.body.appendChild(node);
  node.addEventListener("click", (event) => {
    if (event.target.closest("[data-pwa-dismiss]")) dismiss();
    else if (event.target.closest("[data-pwa-install]")) install();
  });
}

async function install() {
  if (!deferredPrompt) return hide();
  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  try {
    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    writeState(
      choice && choice.outcome === "accepted"
        ? { installed: true, dismissedAt: null }
        : { dismissedAt: Date.now() }
    );
  } catch (err) {
    console.warn("[pwa-install] native prompt failed", err);
    writeState({ dismissedAt: Date.now() });
  }
  hide();
}

function dismiss() {
  writeState({ dismissedAt: Date.now() });
  hide();
}

function hide() {
  document.body.classList.remove("pwa-install-open");
  if (node) {
    node.remove();
    node = null;
  }
}

export function initInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    schedule("android");
  });

  window.addEventListener("appinstalled", () => {
    writeState({ installed: true, dismissedAt: null });
    hide();
  });

  if (isIOS() && !isStandalone()) schedule("ios");
}
