import { t } from "../i18n.js";
import * as store from "../store.js";
import * as auth from "../auth.js";
import {
  lang,
  escapeHtml,
  fleuron,
  formatDate,
  svgIcon,
  toast,
  confirmDialog
} from "../ui.js";

function initials(user) {
  const first = (user.firstName || "").trim().charAt(0);
  const last = (user.lastName || "").trim().charAt(0);
  return (first + last || user.email.charAt(0) || "?").toUpperCase();
}

export function renderProfile(container) {
  const l = lang();
  const user = auth.currentUser();

  if (!user) return container;

  const member = store.getMembers().find((m) => m.id === user.userId) || user;
  const roleLabel =
    member.role === "owner" ? t("profile.owner", l) : t("profile.member", l);

  container.innerHTML = `
    <div class="view view-pad view-center profile-page">
      <header class="page-head">
        <h1 class="page-title">${escapeHtml(t("profile.title", l))}</h1>
        ${fleuron()}
        <p class="page-sub">${escapeHtml(t("profile.sub", l))}</p>
      </header>

      <section class="profile-card" aria-label="${escapeHtml(t("profile.title", l))}">
        <div class="profile-avatar" aria-hidden="true">${escapeHtml(initials(member))}</div>
        <h2 class="profile-name">${escapeHtml([member.firstName, member.lastName].filter(Boolean).join(" "))}</h2>
        <p class="profile-role">${escapeHtml(roleLabel)}</p>

        <dl class="profile-meta">
          <div><dt>${escapeHtml(t("profile.email", l))}</dt><dd>${escapeHtml(member.email)}</dd></div>
          <div><dt>${escapeHtml(t("profile.memberSince", l))}</dt><dd>${escapeHtml(formatDate(member.joined, l))}</dd></div>
          <div><dt>${escapeHtml(t("profile.lastLogin", l))}</dt><dd>${escapeHtml(formatDate(member.lastLogin, l))}</dd></div>
        </dl>
      </section>

      <button class="btn btn-secondary btn-block btn-logout" data-logout>
        ${svgIcon("external", "icon icon-sm")}${escapeHtml(t("profile.logout", l))}
      </button>
    </div>
  `;

  container.querySelector("[data-logout]").addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: t("profile.logoutConfirmTitle", l),
      message: t("profile.logoutConfirmText", l),
      confirmLabel: t("profile.confirmLogout", l),
      danger: true
    });
    if (ok) {
      auth.logout();
      toast(t("profile.logout", l));
    }
  });

  return container;
}
