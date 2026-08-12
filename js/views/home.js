import { t, catName, CATEGORY_ORDER } from "../i18n.js";
import * as store from "../store.js";
import * as auth from "../auth.js";
import { navigate } from "../router.js";
import {
  lang,
  escapeHtml,
  fleuron,
  snippet,
  areaCoverHtml,
  stateEmpty
} from "../ui.js";

function areaCard(area) {
  const l = lang();
  const localized = {
    title: (area.titleI18n && area.titleI18n[l]) || area.title,
    description: (area.descI18n && area.descI18n[l]) || area.description
  };
  const count = store.getContent().filter((i) => i.areaId === area.id).length;
  return `
    <article class="card area-card" data-area-id="${escapeHtml(area.id)}" tabindex="0" role="link" aria-label="${escapeHtml(localized.title)}">
      <div class="card-thumb area-card-thumb">
        ${areaCoverHtml(area)}
      </div>
      <div class="card-body">
        <span class="area-card-kicker">✦ ${escapeHtml(t("areas.course", l))}</span>
        <h3 class="card-title">${escapeHtml(localized.title)}</h3>
        <p class="card-desc">${escapeHtml(snippet(localized.description, 110))}</p>
        <div class="card-footer">
          <span class="area-count">${count} ${escapeHtml(t("areas.pieces", l))}</span>
          <span class="card-open" aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  `;
}

export function renderHome(container) {
  const l = lang();
  const user = auth.currentUser();
  const areas = store.getAccessibleAreas(user);
  const firstName = user && user.firstName ? user.firstName : t("home.greeting", l);

  container.innerHTML = `
    <div class="view view-pad">
      <div class="home-hero">
        <p class="hero-greet">${escapeHtml(t("home.greeting", l))}, ${escapeHtml(firstName)}</p>
        <h1 class="hero-display">${escapeHtml(t("areas.title", l))}</h1>
        ${fleuron()}
        <p class="hero-sub">${escapeHtml(t("areas.sub", l))}</p>
      </div>

      ${
        areas.length
          ? `<section class="home-section" aria-label="${escapeHtml(t("areas.title", l))}">
              <div class="content-grid area-grid">
                ${areas.map(areaCard).join("")}
              </div>
            </section>`
          : stateEmpty(t("areas.emptyTitle", l), t("areas.emptyText", l))
      }

      <section class="home-section" aria-label="${escapeHtml(t("home.quick", l))}">
        <h2 class="section-title">${escapeHtml(t("home.quick", l))}</h2>
        <div class="chip-row wrap">
          ${CATEGORY_ORDER.map(
            (cat) =>
              `<a class="chip" href="#/library" data-cat="${escapeHtml(cat)}">${escapeHtml(catName(cat, l))}</a>`
          ).join("")}
        </div>
      </section>
    </div>
  `;

  container.addEventListener("click", (event) => {
    const cardNode = event.target.closest(".area-card[data-area-id]");
    if (cardNode) {
      navigate(`area/${cardNode.dataset.areaId}`);
      return;
    }
    const chip = event.target.closest("[data-cat]");
    if (chip) {
      sessionStorage.setItem("ac_filter_cat", chip.dataset.cat);
    }
  });

  container.addEventListener("keydown", (event) => {
    const cardNode = event.target.closest(".area-card[data-area-id]");
    if (cardNode && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      navigate(`area/${cardNode.dataset.areaId}`);
    }
  });

  return container;
}
