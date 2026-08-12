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
  stateError
} from "../ui.js";

function card(item) {
  const thumb = makeThumb(item);
  const l = lang();
  const localized = {
    title: (item.titleI18n && item.titleI18n[l]) || item.title,
    description: (item.descI18n && item.descI18n[l]) || item.description
  };
  return `
    <article class="card" data-id="${escapeHtml(item.id)}" tabindex="0" role="link" aria-label="${escapeHtml(localized.title)}">
      <div class="card-thumb">
        <img src="${escapeHtml(thumb.src)}" alt="" loading="lazy" decoding="async" />
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
          <span class="card-open" aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  `;
}

export function renderArea(container, params) {
  const l = lang();
  const user = auth.currentUser();
  const area = store.getArea(params.id);

  if (!user || !area || !store.canAccessArea(user, area.id)) {
    container.innerHTML = `
      <div class="view view-pad">
        ${stateError(
          t("detail.notFound", l),
          () => navigate("home")
        )}
      </div>
    `;
    return container;
  }

  const localized = {
    title: (area.titleI18n && area.titleI18n[l]) || area.title,
    description: (area.descI18n && area.descI18n[l]) || area.description
  };
  const items = store.getContent().filter((i) => i.areaId === area.id);

  container.innerHTML = `
    <div class="view view-pad area-page">
      <button class="btn-link-back" data-back>${svgIcon("chevronLeft", "icon icon-sm")}${escapeHtml(t("area.back", l))}</button>

      <header class="area-hero">
        <div class="area-hero-cover">${areaCoverHtml(area)}</div>
        <div class="area-hero-body">
          <span class="area-card-kicker">✦ ${escapeHtml(t("areas.course", l))}</span>
          <h1 class="detail-title">${escapeHtml(localized.title)}</h1>
          ${localized.description ? `<p class="area-hero-desc">${escapeHtml(localized.description)}</p>` : ""}
          <span class="area-count">${items.length} ${escapeHtml(t("areas.pieces", l))}</span>
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
