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
  svgIcon,
  openUnlockModal,
  productBadge
} from "../ui.js";

function unlockedCard(area) {
  const l = lang();
  const localized = {
    title: (area.titleI18n && area.titleI18n[l]) || area.title,
    description: (area.descI18n && area.descI18n[l]) || area.description
  };
  const count = store.getContent().filter((i) => i.areaId === area.id).length;
  const pBadge = productBadge(area.productType || "main");

  return `
    <article class="card area-card" data-area-id="${escapeHtml(area.id)}" tabindex="0" role="link" aria-label="${escapeHtml(localized.title)}">
      <div class="card-thumb area-card-thumb">
        ${areaCoverHtml(area)}
        <div class="card-badge-overlay">${pBadge}</div>
      </div>
      <div class="card-body">
        <span class="area-card-kicker">✦ UNLOCKED PORTAL</span>
        <h3 class="card-title">${escapeHtml(localized.title)}</h3>
        <p class="card-desc">${escapeHtml(snippet(localized.description, 110))}</p>
        <div class="card-footer">
          <span class="area-count">${count} ${escapeHtml(t("areas.pieces", l))}</span>
          <span class="card-open" aria-hidden="true">Enter Portal →</span>
        </div>
      </div>
    </article>
  `;
}

function lockedCard(area) {
  const l = lang();
  const localized = {
    title: (area.titleI18n && area.titleI18n[l]) || area.title,
    description: (area.descI18n && area.descI18n[l]) || area.description
  };
  const pBadge = productBadge(area.productType || "orderbump");

  return `
    <article class="card area-card card-locked" data-locked-id="${escapeHtml(area.id)}" tabindex="0" role="button" aria-label="${escapeHtml(localized.title)} (Locked)">
      <div class="card-thumb area-card-thumb">
        ${areaCoverHtml(area)}
        <div class="card-badge-overlay">${pBadge}</div>
        <div class="card-locked-veil">
          <div class="lock-icon-circle">
            ${svgIcon("lock", "icon icon-md")}
          </div>
          <span class="lock-label">LOCKED</span>
        </div>
      </div>
      <div class="card-body">
        <span class="area-card-kicker lock-kicker">🔒 SECRET CHAMBER</span>
        <h3 class="card-title">${escapeHtml(localized.title)}</h3>
        <p class="card-desc">${escapeHtml(snippet(localized.description, 110))}</p>
        <div class="card-footer">
          <span class="lock-status-text">Click to Unlock</span>
          <span class="btn-unlock-cta">
            ${svgIcon("bolt", "icon icon-xs")} Unlock Access
          </span>
        </div>
      </div>
    </article>
  `;
}

export function renderHome(container) {
  const l = lang();
  const user = auth.currentUser();
  const allAreas = store.getAllAreasWithAccess(user);
  const unlocked = allAreas.filter((a) => a.isAccessible);
  const locked = allAreas.filter((a) => a.isLocked);

  const streak = store.getStreakData();
  const progress = store.getJourneyProgress(user);
  const firstName = user && user.firstName ? user.firstName : t("home.greeting", l);

  // Duolingo-style re-engagement incentive
  const isInactive = streak.daysInactive >= 1;
  const streakMessage = isInactive
    ? `⚡ <strong>Reconnect Your Frequency:</strong> Your prosperity portal is cooling down! Listen to today's sacred frequency to rekindle your abundance flow.`
    : `✦ <strong>Prosperity Portal Active:</strong> Your alignment frequency is burning bright! Keep your sacred momentum.`;

  container.innerHTML = `
    <div class="view view-pad home-page">
      
      <!-- Duolingo-style Streak & Prosperity Re-engagement Banner -->
      <section class="prosperity-banner ${isInactive ? "prosperity-alert" : "prosperity-active"}" aria-label="Prosperity Frequency Alignment">
        <div class="streak-flame-wrapper">
          <div class="flame-aura"></div>
          ${svgIcon("flame", "flame-svg")}
          <span class="streak-num">${streak.currentStreak || 1}</span>
        </div>
        <div class="prosperity-text-group">
          <div class="streak-title">
            <span class="streak-heading">${streak.currentStreak || 1} Day Sacred Streak</span>
            ${streak.bestStreak > 1 ? `<span class="streak-best">🏆 Best: ${streak.bestStreak}d</span>` : ""}
          </div>
          <p class="prosperity-msg">${streakMessage}</p>
        </div>
      </section>

      <!-- Sacred Journey Progress Bar -->
      <section class="progress-journey-card" aria-label="Sacred Journey Progress">
        <div class="progress-header">
          <div class="progress-title-group">
            <span class="progress-label">✦ SACRED JOURNEY PROGRESS</span>
            <h3 class="progress-heading">${progress.percent}% of Frequencies Mastered</h3>
          </div>
          <span class="progress-counts">${progress.completedCount} / ${progress.totalLessons} Lessons</span>
        </div>

        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width: ${progress.percent}%">
            <div class="progress-shine"></div>
          </div>
        </div>

        ${
          progress.nextLesson
            ? `<div class="progress-footer">
                <span class="next-lesson-hint">Next Frequency: <strong>${escapeHtml(progress.nextLesson.title)}</strong></span>
                <a class="btn-continue-journey" href="#/content/${escapeHtml(progress.nextLesson.id)}" data-continue="${escapeHtml(progress.nextLesson.id)}">
                  ${svgIcon("play", "icon icon-xs")} Continue Journey →
                </a>
              </div>`
            : `<div class="progress-footer">
                <span class="next-lesson-hint">🌟 <strong>Congratulations!</strong> You have ascended through all active frequencies.</span>
              </div>`
        }
      </section>

      <div class="home-hero">
        <p class="hero-greet">${escapeHtml(t("home.greeting", l))}, ${escapeHtml(firstName)}</p>
        <h1 class="hero-display">The Aramaic Portal</h1>
        ${fleuron()}
        <p class="hero-sub">Enter your sacred frequencies, expand your consciousness, and claim your divine abundance.</p>
      </div>

      <!-- Unlocked Modules Section -->
      <section class="home-section" aria-label="Unlocked Portals">
        <div class="section-header-group">
          <h2 class="section-title">Your Unlocked Portals</h2>
          <span class="section-subtitle">${unlocked.length} Active Modules</span>
        </div>
        <div class="content-grid area-grid">
          ${unlocked.map(unlockedCard).join("")}
        </div>
      </section>

      <!-- Secret Chambers & Sacred Expansions Section -->
      ${
        locked.length
          ? `<section class="home-section locked-expansions-section" aria-label="Secret Chambers & Sacred Expansions">
              <div class="section-header-group">
                <h2 class="section-title">Secret Chambers & Sacred Expansions</h2>
                <span class="section-subtitle">Unlock higher frequencies and ancient consecrated rites</span>
              </div>
              <div class="content-grid area-grid">
                ${locked.map(lockedCard).join("")}
              </div>
            </section>`
          : ""
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

  // Interaction handlers
  container.addEventListener("click", (event) => {
    // Unlocked module click
    const unlockedNode = event.target.closest(".area-card[data-area-id]");
    if (unlockedNode) {
      navigate(`area/${unlockedNode.dataset.areaId}`);
      return;
    }

    // Locked module click -> open unlock modal
    const lockedNode = event.target.closest(".area-card[data-locked-id]");
    if (lockedNode) {
      const area = allAreas.find((a) => a.id === lockedNode.dataset.lockedId);
      if (area) openUnlockModal(area);
      return;
    }

    // Continue journey button
    const continueBtn = event.target.closest("[data-continue]");
    if (continueBtn) {
      event.preventDefault();
      navigate(`content/${continueBtn.dataset.continue}`);
      return;
    }

    const chip = event.target.closest("[data-cat]");
    if (chip) {
      sessionStorage.setItem("ac_filter_cat", chip.dataset.cat);
    }
  });

  container.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const unlockedNode = event.target.closest(".area-card[data-area-id]");
    if (unlockedNode) {
      event.preventDefault();
      navigate(`area/${unlockedNode.dataset.areaId}`);
      return;
    }
    const lockedNode = event.target.closest(".area-card[data-locked-id]");
    if (lockedNode) {
      event.preventDefault();
      const area = allAreas.find((a) => a.id === lockedNode.dataset.lockedId);
      if (area) openUnlockModal(area);
    }
  });

  return container;
}
