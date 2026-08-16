import { t, catName, TYPE_ORDER, CATEGORY_ORDER } from "../i18n.js";
import * as store from "../store.js";
import * as auth from "../auth.js";
import { navigate } from "../router.js";
import {
  lang,
  escapeHtml,
  fleuron,
  makeThumb,
  formatDate,
  typeBadge,
  snippet,
  stateLoading,
  stateEmpty,
  stateError
} from "../ui.js";

const LS_TYPE = "ac_filter_type";
const LS_CAT = "ac_filter_cat";
const LS_AREA = "ac_filter_area";

function loadFilters() {
  let type = "all";
  let cat = "all";
  let area = "all";
  try {
    type = sessionStorage.getItem(LS_TYPE) || "all";
    cat = sessionStorage.getItem(LS_CAT) || "all";
    area = sessionStorage.getItem(LS_AREA) || "all";
  } catch (err) {
    type = "all";
    cat = "all";
    area = "all";
  }
  return { type, cat, area };
}

function saveFilters(type, cat, area) {
  try {
    sessionStorage.setItem(LS_TYPE, type);
    sessionStorage.setItem(LS_CAT, cat);
    sessionStorage.setItem(LS_AREA, area);
  } catch (err) {}
}

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

export function renderLibrary(container) {
  const l = lang();

  container.innerHTML = `
    <div class="view view-pad">
      <header class="page-head">
        <h1 class="page-title">${escapeHtml(t("library.title", l))}</h1>
        ${fleuron()}
        <p class="page-sub">${escapeHtml(t("library.sub", l))}</p>
      </header>
      <div data-library-content>${stateLoading()}</div>
    </div>
  `;

  const holder = container.querySelector("[data-library-content]");
  const renderAfterTick = () => {
    setTimeout(() => {
      try {
        renderContent();
      } catch (err) {
        holder.innerHTML = stateError(String(err && err.message ? err.message : err));
      }
    }, 250);
  };

  function renderContent() {
    const { type, cat, area } = loadFilters();
    let items;
    let areas;
    try {
      const user = auth.currentUser();
      items = store.getAccessibleItems(user);
      areas = store.getAccessibleAreas(user);
    } catch (err) {
      holder.innerHTML = stateError(String(err && err.message ? err.message : err));
      return;
    }

    if (!items.length && !areas.length) {
      holder.innerHTML = stateEmpty(
        t("library.emptyLibraryTitle", l),
        t("library.emptyLibraryText", l)
      );
      return;
    }

    if (!items.length) {
      holder.innerHTML = stateEmpty(
        t("areas.emptyTitle", l),
        t("areas.emptyText", l)
      );
      return;
    }

    const areaOptions = areas.map((a) => {
      const aTitle = (a.titleI18n && a.titleI18n[l]) || a.title;
      return `<button class="chip ${area === a.id ? "active" : ""}" data-area="${escapeHtml(a.id)}">${escapeHtml(aTitle)}</button>`;
    });

    const filtered = items.filter(
      (i) =>
        (area === "all" || i.areaId === area) &&
        (type === "all" || i.type === type) &&
        (cat === "all" || i.category === cat)
    );

    holder.innerHTML = `
      <div class="filter-block">
        ${
          areas.length
            ? `<p class="filter-label">${escapeHtml(t("admin.contentFilter", l))}</p>
               <div class="chip-row" data-area-chips>
                 <button class="chip ${area === "all" ? "active" : ""}" data-area="all">${escapeHtml(t("common.all", l))}</button>
                 ${areaOptions.join("")}
               </div>`
            : ""
        }

        <p class="filter-label">${escapeHtml(t("library.typeFilter", l))}</p>
        <div class="chip-row" data-type-chips>
          <button class="chip ${type === "all" ? "active" : ""}" data-type="all">${escapeHtml(t("common.all", l))}</button>
          ${TYPE_ORDER.map(
            (tp) =>
              `<button class="chip ${type === tp ? "active" : ""}" data-type="${escapeHtml(tp)}">${escapeHtml(t(`types.${tp}`, l))}</button>`
          ).join("")}
        </div>

        <p class="filter-label">${escapeHtml(t("library.categoryFilter", l))}</p>
        <div class="chip-row" data-cat-chips>
          <button class="chip ${cat === "all" ? "active" : ""}" data-cat="all">${escapeHtml(t("common.all", l))}</button>
          ${CATEGORY_ORDER.map(
            (c) =>
              `<button class="chip ${cat === c ? "active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(catName(c, l))}</button>`
          ).join("")}
        </div>
      </div>

      ${
        filtered.length
          ? `<div class="content-grid" data-grid>
              ${filtered.map(card).join("")}
            </div>`
          : stateEmpty(
              t("library.emptyTitle", l),
              t("library.emptyText", l),
              `<button class="btn btn-secondary btn-sm" data-clear-filters>${escapeHtml(t("common.all", l))}</button>`
            )
      }
    `;

    const areaChips = holder.querySelector("[data-area-chips]");
    if (areaChips) {
      areaChips.addEventListener("click", (event) => {
        const chip = event.target.closest("[data-area]");
        if (!chip) return;
        saveFilters(type, cat, chip.dataset.area);
        renderContent();
      });
    }

    holder.querySelector("[data-type-chips]").addEventListener("click", (event) => {
      const chip = event.target.closest("[data-type]");
      if (!chip) return;
      saveFilters(chip.dataset.type, cat, area);
      renderContent();
    });

    holder.querySelector("[data-cat-chips]").addEventListener("click", (event) => {
      const chip = event.target.closest("[data-cat]");
      if (!chip) return;
      saveFilters(type, chip.dataset.cat, area);
      renderContent();
    });

    const clearBtn = holder.querySelector("[data-clear-filters]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        saveFilters("all", "all", "all");
        renderContent();
      });
    }

    const grid = holder.querySelector("[data-grid]");
    if (grid) {
      grid.addEventListener("click", (event) => {
        const cardNode = event.target.closest(".card[data-id]");
        if (cardNode) navigate(`content/${cardNode.dataset.id}`);
      });
      grid.addEventListener("keydown", (event) => {
        const cardNode = event.target.closest(".card[data-id]");
        if (cardNode && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          navigate(`content/${cardNode.dataset.id}`);
        }
      });
    }
  }

  renderAfterTick();
  return container;
}
