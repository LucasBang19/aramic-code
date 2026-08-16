import { t, catName } from "../i18n.js";
import * as store from "../store.js";
import * as auth from "../auth.js";
import { navigate } from "../router.js";
import {
  lang,
  escapeHtml,
  makeThumb,
  formatDate,
  formatDuration,
  typeBadge,
  svgIcon,
  openUnlockModal,
  toast
} from "../ui.js";

function toEmbedUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  const m =
    url.match(/youtube\.com\/watch\?v=([\w-]{6,})/) ||
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/youtube\.com\/shorts\/([\w-]{6,})/);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`;
  if (/player\./i.test(url) || url.includes("/embed/")) return url;
  return null;
}

function renderPlayer(item) {
  const l = lang();
  const url = item.url || "";

  if (item.type === "video") {
    const embed = toEmbedUrl(url);
    if (embed) {
      return `
        <div class="embed-wrap">
          <iframe src="${escapeHtml(embed)}" title="${escapeHtml(item.title)}"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>
        <a class="btn btn-secondary btn-block" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
          ${svgIcon("external", "icon icon-sm")}${escapeHtml(t("detail.openExternal", l))}
        </a>`;
    }
    return `
      <div class="player-fallback">
        ${svgIcon("play", "icon icon-xl")}
        <p>${escapeHtml(t("detail.openExternal", l))}</p>
        <a class="btn btn-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
          ${svgIcon("external", "icon icon-sm")}${escapeHtml(t("detail.playVideo", l))}
        </a>
      </div>`;
  }

  if (item.type === "audio") {
    return `
      <div class="audio-wrap">
        <div class="audio-cover">
          <img src="${escapeHtml(makeThumb(item).src)}" alt="" />
          <span class="audio-glyph" aria-hidden="true">${svgIcon("audio", "icon icon-lg")}</span>
        </div>
        <audio controls preload="metadata" src="${escapeHtml(url)}" id="lesson-audio-player">
          <a href="${escapeHtml(url)}">${escapeHtml(t("detail.listenAudio", l))}</a>
        </audio>
        <div class="audio-actions">
          <a class="btn btn-secondary btn-sm" href="${escapeHtml(url)}" download target="_blank" rel="noopener">
            ${svgIcon("download", "icon icon-xs")} Download Audio (Offline)
          </a>
        </div>
      </div>`;
  }

  if (item.type === "file") {
    return `
      <div class="player-fallback file-fallback">
        <div class="file-icon-box">${svgIcon("file", "icon icon-xl")}</div>
        <h4 class="file-name">${escapeHtml(item.title)}</h4>
        <p class="file-desc">Sacred reference text and PDF translation.</p>
        <a class="btn btn-primary btn-gold-glow" href="${escapeHtml(url)}" download target="_blank" rel="noopener">
          ${svgIcon("download", "icon icon-sm")} Download Sacred PDF
        </a>
      </div>`;
  }

  return `
    <div class="player-fallback">
      ${svgIcon("link", "icon icon-xl")}
      <p>${escapeHtml(url)}</p>
      <a class="btn btn-primary" href="${escapeHtml(url)}" target="_blank" rel="noopener">
        ${svgIcon("external", "icon icon-sm")}${escapeHtml(t("detail.openLink", l))}
      </a>
    </div>`;
}

export function renderDetail(container, params) {
  const l = lang();
  const id = params.id;
  const item = store.getItem(id);
  const user = auth.currentUser();

  if (!item) {
    container.innerHTML = `
      <div class="view view-pad">
        <div class="state state-error">
          <h2>Frequency Not Found</h2>
          <button class="btn btn-secondary" onclick="window.history.back()">Go Back</button>
        </div>
      </div>
    `;
    return container;
  }

  const area = store.getArea(item.areaId);
  const canAccess = user && store.canAccessItem(user, item);

  // If user tries to open a locked item, show premium locked screen with checkout button!
  if (!canAccess) {
    const checkoutUrl = (area && area.checkoutUrl) || "https://thearamaiccode.com";
    container.innerHTML = `
      <div class="view view-pad locked-detail-page">
        <button class="btn-link-back" data-back>${svgIcon("chevronLeft", "icon icon-sm")}${escapeHtml(t("common.back", l))}</button>
        <div class="locked-screen-card">
          <div class="lock-screen-icon-wrapper">
            <div class="lock-aura"></div>
            ${svgIcon("lock", "lock-screen-svg")}
          </div>
          <span class="locked-screen-kicker">✦ LOCKED EXCLUSIVE PORTAL</span>
          <h1 class="locked-screen-title">${escapeHtml(item.title)}</h1>
          <p class="locked-screen-desc">${escapeHtml(item.description || "This sacred teaching is part of an exclusive expansion portal.")}</p>
          <div class="locked-screen-actions">
            <a class="btn btn-primary btn-gold-glow btn-lg" href="${escapeHtml(checkoutUrl)}" target="_blank" rel="noopener noreferrer">
              ${svgIcon("bolt", "icon icon-sm")} Unlock Full Access at Checkout →
            </a>
            <button class="btn btn-secondary" data-back>Return to Home</button>
          </div>
        </div>
      </div>
    `;
    container.querySelectorAll("[data-back]").forEach((btn) =>
      btn.addEventListener("click", () => navigate("home"))
    );
    return container;
  }

  const localized = {
    title: (item.titleI18n && item.titleI18n[l]) || item.title,
    description: (item.descI18n && item.descI18n[l]) || item.description
  };
  const thumb = makeThumb(item);
  const duration = formatDuration(item.duration);
  const isCompleted = store.isLessonCompleted(item.id);

  container.innerHTML = `
    <div class="view view-pad detail-page">
      <button class="btn-link-back" data-back>${svgIcon("chevronLeft", "icon icon-sm")}${escapeHtml(t("common.back", l))}</button>

      <article class="detail-card" data-id="${escapeHtml(item.id)}">
        <div class="detail-hero">
          <img src="${escapeHtml(thumb.src)}" alt="" />
        </div>

        <div class="detail-body">
          <div class="card-badges">
            ${typeBadge(item.type)}
            <span class="card-cat">${escapeHtml(catName(item.category, l))}</span>
          </div>

          <h1 class="detail-title">${escapeHtml(localized.title)}</h1>

          <div class="detail-meta">
            ${duration ? `<span class="meta-item">⏱ ${escapeHtml(duration)}</span>` : ""}
            <time class="meta-item" datetime="${escapeHtml(item.createdAt || "")}">${escapeHtml(formatDate(item.createdAt, l))}</time>
          </div>

          <section class="player-section" aria-label="${escapeHtml(t("detail.playVideo", l))}">
            ${renderPlayer(item)}
          </section>

          <!-- Gamification Completion Button -->
          <div class="completion-section">
            <button type="button" class="btn ${isCompleted ? "btn-completed" : "btn-mark-complete"}" id="btn-toggle-complete">
              ${svgIcon("check", "icon icon-sm")}
              <span id="complete-text">${isCompleted ? "✦ Frequency Completed" : "Mark as Mastered"}</span>
            </button>
          </div>

          ${
            localized.description
              ? `<section class="detail-section">
                  <h2 class="detail-h2">${escapeHtml(t("detail.description", l))}</h2>
                  <p class="detail-text">${escapeHtml(localized.description)}</p>
                </section>`
              : ""
          }

          <section class="detail-section">
            <h2 class="detail-h2">${escapeHtml(t("detail.category", l))}</h2>
            <div class="chip-row wrap">
              <span class="chip chip-active">${escapeHtml(catName(item.category, l))}</span>
              ${(item.tags || [])
                .map((tag) => `<span class="chip">#${escapeHtml(tag)}</span>`)
                .join("")}
            </div>
          </section>
        </div>
      </article>
    </div>
  `;

  // Back button
  container.querySelector("[data-back]").addEventListener("click", () => {
    if (item.areaId) navigate(`area/${item.areaId}`);
    else navigate("home");
  });

  // Completion toggle button
  const completeBtn = container.querySelector("#btn-toggle-complete");
  const completeText = container.querySelector("#complete-text");
  if (completeBtn) {
    completeBtn.addEventListener("click", () => {
      const nextState = store.toggleLessonCompleted(item.id);
      completeBtn.className = `btn ${nextState ? "btn-completed" : "btn-mark-complete"}`;
      completeText.textContent = nextState
        ? "✦ Frequency Completed"
        : "Mark as Mastered";
      if (nextState) {
        toast("✦ Sacred Frequency Mastered! Streak updated.", "success");
      }
    });
  }

  // Auto-mark completed when audio reaches the end!
  const audioEl = container.querySelector("#lesson-audio-player");
  if (audioEl) {
    audioEl.addEventListener("ended", () => {
      if (!store.isLessonCompleted(item.id)) {
        store.setLessonCompleted(item.id, true);
        if (completeBtn && completeText) {
          completeBtn.className = "btn btn-completed";
          completeText.textContent = "✦ Frequency Completed";
          toast("✦ Frequency complete! Your streak has increased 🔥", "success");
        }
      }
    });
  }

  return container;
}
