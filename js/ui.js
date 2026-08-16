import { t, typeName, catName } from "./i18n.js";
import { getLanguage } from "./store.js";

export function lang() {
  return getLanguage();
}

export function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function el(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

const ICONS = {
  home:
    '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h5v-6h4v6h5V9.8"/>',
  library:
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  admin:
    '<path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z"/><path d="M9.5 12l1.8 1.8L15 10.2"/>',
  profile:
    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
  play:
    '<path d="M8 5.5v13l11-6.5z"/>',
  audio:
    '<path d="M4 10v4h4l5 4V6l-5 4H4z"/><path d="M17 9a4 4 0 0 1 0 6"/>',
  file:
    '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/><path d="M9 14h6M9 18h4"/>',
  link:
    '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19"/>',
  chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash:
    '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
  external:
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  edit:
    '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>',
  lock:
    '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  unlock:
    '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>',
  sparkles:
    '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  trophy:
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M6 4h12a2 2 0 0 1 2 2v3a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V6a2 2 0 0 1 2-2z"/>',
  bolt:
    '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  check:
    '<polyline points="20 6 9 17 4 12"/>',
  crown:
    '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>'
};

export function svgIcon(name, cls) {
  const body = ICONS[name] || ICONS.link;
  return `<svg class="${cls || "icon"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export function logoMark(size) {
  const s = size || 40;
  return `<svg class="logo-mark" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="30" fill="none" stroke="url(#lg1)" stroke-width="1.5" opacity="0.85"/>
    <circle cx="32" cy="32" r="24" fill="#ffd766" opacity="0.12"/>
    <polygon points="32,14 45,44 19,44" fill="none" stroke="url(#lg2)" stroke-width="2.4" stroke-linejoin="round"/>
    <polygon points="32,50 45,20 19,20" fill="none" stroke="url(#lg2)" stroke-width="2.4" stroke-linejoin="round"/>
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f7e7ad"/><stop offset="100%" stop-color="#b8912f"/></linearGradient>
      <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f7e7ad"/><stop offset="100%" stop-color="#d9ab3c"/></linearGradient>
    </defs>
  </svg>`;
}

export function fleuron() {
  return `<div class="fleuron" aria-hidden="true"><span>✦</span><span>◆</span><span>✦</span></div>`;
}

export function spinner(size) {
  return `<div class="spinner" style="width:${size || 44}px;height:${size || 44}px"></div>`;
}

export function stateLoading(text) {
  return `<div class="state state-loading" role="status" aria-live="polite">
    ${spinner()}
    <p class="loading-text">${escapeHtml(text || t("states.loading", lang()))}</p>
  </div>`;
}

export function stateError(message, onRetry) {
  const retry = onRetry
    ? `<button class="btn btn-secondary btn-sm" data-retry>${escapeHtml(t("states.retry", lang()))}</button>`
    : "";
  return `<div class="state state-error" role="alert">
    <div class="error-icon" aria-hidden="true">⚠</div>
    <h2>${escapeHtml(t("states.error", lang()))}</h2>
    <p class="error-message">${escapeHtml(message || "")}</p>
    ${retry}
  </div>`;
}

export function stateEmpty(title, text, action) {
  return `<div class="state state-empty">
    <div class="empty-icon">${fleuron()}</div>
    <h2>${escapeHtml(title)}</h2>
    <p>${escapeHtml(text)}</p>
    ${action || ""}
  </div>`;
}

let toastTimer = null;
export function toast(message, kind) {
  let node = document.getElementById("toast");
  if (!node) {
    node = document.createElement("div");
    node.id = "toast";
    node.className = "toast";
    node.setAttribute("role", "status");
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.className = "toast toast-show" + (kind ? " toast-" + kind : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    node.className = "toast";
  }, 2600);
}

export function openModal({ title, body, footer, onMount }) {
  const modal = el(`
    <div class="modal-backdrop" role="presentation">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <header class="modal-header">
          <h3 class="modal-title">${escapeHtml(title)}</h3>
          <button type="button" class="btn-icon" data-close aria-label="${escapeHtml(t("common.close", lang()))}">×</button>
        </header>
        <div class="modal-body">${body}</div>
        ${footer ? `<footer class="modal-footer">${footer}</footer>` : ""}
      </div>
    </div>
  `);
  document.body.appendChild(modal);
  document.body.classList.add("modal-open");
  if (onMount) onMount(modal, close);

  function close() {
    document.body.classList.remove("modal-open");
    modal.remove();
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) {
    if (e.key === "Escape") close();
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", onKey);
  return { modal, close };
}

export function openUnlockModal(area) {
  const l = lang();
  const checkoutUrl = area.checkoutUrl || "https://thearamaiccode.com";
  const typeKicker =
    area.productType === "upsell"
      ? "👑 MASTER TRANSMISSION PORTAL"
      : area.productType === "orderbump"
      ? "✦ SECRET SACRED EXPANSION"
      : "🔒 LOCKED SACRED PORTAL";

  const body = `
    <div class="unlock-modal-content">
      <div class="unlock-icon-wrapper">
        <div class="unlock-icon-aura"></div>
        ${svgIcon("lock", "unlock-icon-svg")}
      </div>
      <span class="unlock-kicker">${escapeHtml(typeKicker)}</span>
      <h3 class="unlock-title">${escapeHtml(area.title)}</h3>
      <p class="unlock-desc">${escapeHtml(area.description || "Unlock full access to this sacred frequency, exclusive teachings, and ancient abundance codes.")}</p>
      
      <div class="unlock-perks">
        <div class="unlock-perk">
          <span class="unlock-perk-icon">✦</span>
          <span>Instant lifetime access in your member portal</span>
        </div>
        <div class="unlock-perk">
          <span class="unlock-perk-icon">✦</span>
          <span>HD audio frequencies with offline listening option</span>
        </div>
        <div class="unlock-perk">
          <span class="unlock-perk-icon">✦</span>
          <span>Accelerated divine manifestation & wealth alignment</span>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button type="button" class="btn btn-secondary" data-close>Close</button>
    <a class="btn btn-primary btn-gold-glow" href="${escapeHtml(checkoutUrl)}" target="_blank" rel="noopener noreferrer">
      ${svgIcon("bolt", "icon icon-sm")} Get Instant Access →
    </a>
  `;

  return openModal({
    title: "Unlock Sacred Access",
    body,
    footer
  });
}

export function confirmDialog({ title, message, confirmLabel, danger }) {
  return new Promise((resolve) => {
    const { modal, close } = openModal({
      title,
      body: `<p class="dialog-message">${escapeHtml(message)}</p>`,
      footer: `
        <button type="button" class="btn btn-secondary" data-dialog-cancel>${escapeHtml(t("common.cancel", lang()))}</button>
        <button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" data-dialog-ok>${escapeHtml(confirmLabel || t("common.delete", lang()))}</button>
      `,
      onMount: (m) => {
        m.querySelector("[data-dialog-cancel]").focus();
        m.addEventListener("click", (e) => {
          if (e.target.closest("[data-dialog-cancel]")) {
            close();
            resolve(false);
          } else if (e.target.closest("[data-dialog-ok]")) {
            close();
            resolve(true);
          }
        });
      }
    });
    void modal;
  });
}

const TYPE_GLYPH = { video: "▶", audio: "♫", file: "↓", link: "↗" };
const THUMB_GRADIENTS = {
  prayer: ["#3b1f4e", "#050301"],
  meditation: ["#241305", "#050301"],
  teaching: ["#332a1d", "#050301"],
  tool: ["#4e3c1d", "#050301"]
};

export function makeThumb(item) {
  if (item.thumbnail && isMediaSource(item.thumbnail)) {
    return { src: item.thumbnail, generated: false };
  }
  const g = THUMB_GRADIENTS[item.category] || THUMB_GRADIENTS.tool;
  const glyph = TYPE_GLYPH[item.type] || "✦";
  const title = String(item.title || "").slice(0, 22);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/>` +
    `</linearGradient></defs>` +
    `<rect width="320" height="180" fill="url(#g)"/>` +
    `<circle cx="160" cy="88" r="52" fill="none" stroke="rgba(217,171,60,0.45)" stroke-width="2"/>` +
    `<circle cx="160" cy="88" r="64" fill="none" stroke="rgba(217,171,60,0.22)" stroke-width="1"/>` +
    `<text x="160" y="106" text-anchor="middle" font-size="54" fill="rgba(247,231,173,0.92)">${glyph}</text>` +
    `<text x="160" y="150" text-anchor="middle" font-size="15" font-family="Cinzel,serif" fill="rgba(236,220,194,0.75)">${title}</text>` +
    `</svg>`;
  return { src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg), generated: true };
}

function generatedAreaCover(area) {
  const title = String((area && area.title) || "Module").slice(0, 26);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">` +
    `<defs><linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#3b1f4e"/><stop offset="1" stop-color="#050301"/>` +
    `</linearGradient></defs>` +
    `<rect width="640" height="360" fill="url(#ag)"/>` +
    `<circle cx="320" cy="180" r="112" fill="none" stroke="rgba(217,171,60,0.45)" stroke-width="2"/>` +
    `<circle cx="320" cy="180" r="138" fill="none" stroke="rgba(217,171,60,0.22)" stroke-width="1"/>` +
    `<polygon points="320,118 366,240 274,240" fill="none" stroke="rgba(247,231,173,0.75)" stroke-width="2"/>` +
    `<polygon points="320,242 366,120 274,120" fill="none" stroke="rgba(247,231,173,0.4)" stroke-width="1.5"/>` +
    `<text x="320" y="296" text-anchor="middle" font-size="22" font-family="Cinzel,serif" fill="rgba(236,220,194,0.82)">${title}</text>` +
    `</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export function makeAreaCover(area) {
  const generated = generatedAreaCover(area);
  if (area && area.cover && isMediaSource(area.cover)) {
    return { src: area.cover, fallback: generated };
  }
  return { src: generated, fallback: generated };
}

function isMediaSource(value) {
  return /^(https?:\/\/|data:image\/|\.\/|\.\.\/|\/|assets\/)/i.test(String(value || ""));
}

export function areaCoverHtml(area, cls) {
  const { src, fallback } = makeAreaCover(area);
  return `<img class="${cls || ""}" src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${escapeHtml(fallback)}'" />`;
}

export function formatDate(iso, language) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(d);
  } catch (err) {
    return String(iso).slice(0, 10);
  }
}

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} ${t("detail.minutes", lang())}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m} ${t("detail.minutes", lang())}` : `${h}h`;
}

export function typeBadge(type) {
  const icon = { video: "play", audio: "audio", file: "file", link: "link" }[type] || "link";
  return `<span class="type-badge type-badge-${escapeHtml(type)}">${svgIcon(icon, "icon icon-sm")}${escapeHtml(typeName(type, lang()))}</span>`;
}

export function productBadge(productType) {
  if (productType === "upsell") {
    return `<span class="badge badge-upsell">${svgIcon("crown", "icon icon-xs")} MASTER TRANSMISSION</span>`;
  }
  if (productType === "orderbump") {
    return `<span class="badge badge-orderbump">${svgIcon("sparkles", "icon icon-xs")} SECRET CHAMBER</span>`;
  }
  return `<span class="badge badge-main">✦ CORE ACCESS</span>`;
}

export function categoryLabel(slug) {
  return escapeHtml(catName(slug, lang()));
}

export function snippet(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).trim() + "…";
}
