import * as auth from "./auth.js";
import * as store from "./store.js";
import { t } from "./i18n.js";

import { renderLogin } from "./views/login.js";
import { renderHome } from "./views/home.js";
import { renderLibrary } from "./views/library.js";
import { renderArea } from "./views/area.js";
import { renderDetail } from "./views/detail.js";
import { renderAdmin } from "./views/admin.js";
import { renderProfile } from "./views/profile.js";

const ROUTES = [
  { name: "login", pattern: /^login$/, render: renderLogin, public: true },
  { name: "home", pattern: /^home$/, render: renderHome },
  { name: "library", pattern: /^library$/, render: renderLibrary },
  { name: "area", pattern: /^area\/(.+)$/, render: renderArea },
  { name: "content", pattern: /^content\/(.+)$/, render: renderDetail },
  { name: "admin", pattern: /^admin$/, render: renderAdmin, ownerOnly: true },
  { name: "profile", pattern: /^profile$/, render: renderProfile }
];

const DEFAULT = "home";

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash.split("/").filter(Boolean).map(decodeURIComponent);
}

export function navigate(path) {
  const clean = path.replace(/^#/, "");
  if ("#" + clean === window.location.hash) {
    render();
  } else {
    window.location.hash = "#" + clean;
  }
}

function matchRoute(segments) {
  if (segments.length === 0) {
    return { route: ROUTES.find((r) => r.name === DEFAULT), params: {} };
  }
  const path = segments.join("/");
  for (const route of ROUTES) {
    const m = path.match(route.pattern);
    if (m) return { route, params: { id: m[1] } };
  }
  return null;
}

function updateChrome(routeName) {
  const nav = document.getElementById("bottom-nav");
  if (nav) nav.hidden = routeName === "login";

  document.querySelectorAll("[data-nav]").forEach((item) => {
    const active =
      item.dataset.nav === routeName ||
      (routeName === "content" && item.dataset.nav === "library") ||
      (routeName === "area" && item.dataset.nav === "library") ||
      (routeName === "login" && item.dataset.nav === "home");
    item.classList.toggle("active", active);
    if (item.dataset.nav === "admin") item.hidden = !auth.isOwner();
  });

  const currentLang = store.getLanguage();
  document.querySelectorAll("[data-nav] .nav-label").forEach((label) => {
    const name = label.closest("[data-nav]").dataset.nav;
    const text = { home: "home", library: "library", admin: "admin", profile: "profile" }[name];
    if (text) label.textContent = t(`nav.${text}`, currentLang);
  });
}

function applyView(route, view, params) {
  Promise.resolve(route.render(view, params)).catch((err) => {
    console.error("[router] render failed", err);
  });
}

function renderCurrentView() {
  const view = document.getElementById("view");
  const matched = matchRoute(parseHash());
  if (!view || !matched) return;
  view.dataset.route = matched.route.name;
  applyView(matched.route, view, matched.params);
}

const ROUTE_LEAVE_MS = 200;
const ROUTE_ENTER_MS = 500;

function render() {
  const segments = parseHash();
  const matched = matchRoute(segments);
  const authed = auth.isAuthed();

  let route;
  let params = {};

  if (!authed && !matched?.route?.public) {
    route = ROUTES.find((r) => r.name === "login");
  } else if (matched?.route?.ownerOnly && !auth.isOwner()) {
    route = ROUTES.find((r) => r.name === "home");
  } else if (matched) {
    route = matched.route;
    params = matched.params;
  } else {
    route = ROUTES.find((r) => r.name === DEFAULT);
  }

  if (authed && route.name === "login") {
    route = ROUTES.find((r) => r.name === DEFAULT);
  }

  updateChrome(route.name);

  const view = document.getElementById("view");
  if (!view) return;

  document.documentElement.lang = store.getLanguage();
  document.title = `${t("brand", store.getLanguage())} — ${t("tagline", store.getLanguage())}`;

  view.dataset.route = route.name;
  window.scrollTo(0, 0);

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Gentle parchment crossfade between views (skipped on first paint & reduced motion)
  if (prefersReduced || !view.firstElementChild) {
    applyView(route, view, params);
    view.classList.add("view-enter");
    window.setTimeout(() => view.classList.remove("view-enter"), ROUTE_ENTER_MS);
    return;
  }

  view.classList.add("view-leave");
  window.setTimeout(() => {
    applyView(route, view, params);
    view.classList.remove("view-leave");
    view.classList.add("view-enter");
    window.setTimeout(() => view.classList.remove("view-enter"), ROUTE_ENTER_MS);
  }, ROUTE_LEAVE_MS);
}

export function start() {
  window.addEventListener("hashchange", render);
  store.onChange((event) => {
    if (event === "language") render();
    else if (event === "session") render();
    else if (event === "content") renderCurrentView();
    else if (event === "areas" || event === "members") renderCurrentView();
  });
  render();
}
