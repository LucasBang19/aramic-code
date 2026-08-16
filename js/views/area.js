import { t, catName } from "../i18n.js";
import * as store from "../store.js";
import * as auth from "../auth.js";
import { navigate } from "../router.js";
import {
  lang,
  escapeHtml,
  makeThumb,
  formatDate,
  typeBadge,
  snippet,
  svgIcon,
  areaCoverHtml,
  stateEmpty,
  productBadge
} from "../ui.js";

function card(item) {
  const thumb = makeThumb(item);
  const l = lang();
  const localized = {
    title: (item.titleI18n && item.titleI18n[l]) || item.title,
    description: (item.descI18n && item.descI18n[l]) || item.description
  };
  const isCompleted = store.isLessonCompleted(item.id);

  return `
    <article class="card ${isCompleted ? "card-completed" : ""}" data-id="${escapeHtml(item.id)}" tabindex="0" role="link" aria-label="${escapeHtml(localized.title)}">
      <div class="card-thumb">
        <img src="${escapeHtml(thumb.src)}" alt="" loading="lazy" decoding="async" />
        ${
          isCompleted
            ? `<div class="card-completed-badge">${svgIcon("check", "icon icon-xs")} Mastered</div>`
            : ""
        }
      </div>
      <div class="card-body">
        <div class="card-badges">
          ${typeBadge(item.type)}
          <span class="card-cat">${escapeHtml(catName(item.category, l))}</span>
        </div>
        <h3 class="card-title">${escapeHtml(localized.title)}</h3>
        <p class="card-desc">${escapeHtml(snippet(localized.description, 110))}</p>
        <div class="card-footer">
          <time class="card-date" datetime="${escapeHtml(item.createdAt || "")}">${escapeHtml(formatDate(item.createdAt, l))}</time>
          <span class="card-open" aria-hidden="true">${isCompleted ? "Listen Again →" : "Start Frequency →"}</span>
        </div>
      </div>
    </article>
  `;
}

export function renderArea(container, params) {
  const l = lang();
  const user = auth.currentUser();
  const area = store.getArea(params.id);

  if (!area) {
    container.innerHTML = `
      <div class="view view-pad">
        <div class="state state-error">
          <h2>Portal Not Found</h2>
          <button class="btn btn-secondary" onclick="window.history.back()">Return Home</button>
        </div>
      </div>
    `;
    return container;
  }

  const canAccess = user && store.canAccessArea(user, area.id);

  // If user tries to open a locked area, show dedicated locked upgrade screen
  if (!canAccess) {
    const checkoutUrl = area.checkoutUrl || "https://thearamaiccode.com";
    container.innerHTML = `
      <div class="view view-pad locked-area-page">
        <button class="btn-link-back" data-back>${svgIcon("chevronLeft", "icon icon-sm")}${escapeHtml(t("common.back", l))}</button>
        <div class="locked-screen-card">
          <div class="lock-screen-icon-wrapper">
            <div class="lock-aura"></div>
            ${svgIcon("lock", "lock-screen-svg")}
          </div>
          <div class="locked-badge-wrap">${productBadge(area.productType || "orderbump")}</div>
          <h1 class="locked-screen-title">${escapeHtml(area.title)}</h1>
          <p class="locked-screen-desc">${escapeHtml(area.description || "This sacred expansion portal is locked for your account.")}</p>
          
          <div class="unlock-perks-box">
            <div class="perk-item">✦ Instant unlock of all teachings & audio frequencies</div>
            <div class="perk-item">✦ Lifetime portal access & offline audio downloads</div>
            <div class="perk-item">✦ Quantum alignment for wealth and spiritual protection</div>
          </div>

          <div class="locked-screen-actions">
            <a class="btn btn-primary btn-gold-glow btn-lg" href="${escapeHtml(checkoutUrl)}" target="_blank" rel="noopener noreferrer">
              ${svgIcon("bolt", "icon icon-sm")} Get Instant Access at Checkout →
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
    title: (area.titleI18n && area.titleI18n[l]) || area.title,
    description: (area.descI18n && area.descI18n[l]) || area.description
  };
  const items = store.getContent().filter((i) => i.areaId === area.id);
  const completedInArea = items.filter((i) => store.isLessonCompleted(i.id)).length;

  container.innerHTML = `
    <div class="view view-pad area-page">
      <button class="btn-link-back" data-back>${svgIcon("chevronLeft", "icon icon-sm")}${escapeHtml(t("area.back", l))}</button>

      <header class="area-hero">
        <div class="area-hero-cover">${areaCoverHtml(area)}</div>
        <div class="area-hero-body">
          <div class="area-badges-top">${productBadge(area.productType || "main")}</div>
          <h1 class="detail-title">${escapeHtml(localized.title)}</h1>
          ${localized.description ? `<p class="area-hero-desc">${escapeHtml(localized.description)}</p>` : ""}
          <div class="area-meta-row">
            <span class="area-count">${items.length} ${escapeHtml(t("areas.pieces", l))}</span>
            <span class="area-completed-count">✦ ${completedInArea} / ${items.length} Mastered</span>
          </div>
        </div>
      </header>

      <div data-area-content>
        ${
          items.length
            ? `<div class="content-grid">${items.map(card).join("")}</div>`
            : stateEmpty(t("area.emptyTitle", l), t("area.emptyText", l))
        }
      </div>
    </div>
  `;

  container.querySelector("[data-back]").addEventListener("click", () => {
    navigate("home");
  });

  const holder = container.querySelector("[data-area-content]");
  holder.addEventListener("click", (event) => {
    const cardNode = event.target.closest(".card[data-id]");
    if (cardNode) navigate(`content/${cardNode.dataset.id}`);
  });

  holder.addEventListener("keydown", (event) => {
    const cardNode = event.target.closest(".card[data-id]");
    if (cardNode && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      navigate(`content/${cardNode.dataset.id}`);
    }
  });

  return container;
}
