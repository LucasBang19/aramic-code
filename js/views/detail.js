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
  stateError
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
        <audio controls preload="metadata" src="${escapeHtml(url)}">
          <a href="${escapeHtml(url)}">${escapeHtml(t("detail.listenAudio", l))}</a>
        </audio>
      </div>`;
  }

  if (item.type === "file") {
    return `
      <div class="player-fallback">
        ${svgIcon("file", "icon icon-xl")}
        <p>${escapeHtml(item.title)}</p>
        <a class="btn btn-primary" href="${escapeHtml(url)}" download target="_blank" rel="noopener">
          ${svgIcon("download", "icon icon-sm")}${escapeHtml(t("detail.downloadFile", l))}
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

  if (!item || !user || !store.canAccessItem(user, item)) {
    container.innerHTML = `
      <div class="view view-pad">
        ${stateError(
          `${t("detail.notFound", l)} ${t("detail.notFoundSub", l)}`,
          () => navigate("library")
        )}
      </div>
    `;
    return container;
  }

  const localized = {
    title: (item.titleI18n && item.titleI18n[l]) || item.title,
    description: (item.descI18n && item.descI18n[l]) || item.description
  };
  const thumb = makeThumb(item);
  const duration = formatDuration(item.duration);

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
              <span class="chip static">${escapeHtml(catName(item.category, l))}</span>
            </div>
          </section>

          ${
            item.tags && item.tags.length
              ? `<section class="detail-section">
                  <h2 class="detail-h2">${escapeHtml(t("detail.tags", l))}</h2>
                  <div class="chip-row wrap">
                    ${item.tags.map((tag) => `<span class="chip static">#${escapeHtml(tag)}</span>`).join("")}
                  </div>
                </section>`
              : ""
          }
        </div>
      </article>
    </div>
  `;

  container.querySelector("[data-back]").addEventListener("click", () => {
    navigate("library");
  });

  return container;
}
