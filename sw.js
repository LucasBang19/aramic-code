const CACHE_NAME = "members-ceramic-shell-v15";
const APP_SHELL = [
  "./",
  "./manifest.json",
  "./css/tokens.css",
  "./css/app.css",
  "./icons/icon.svg",
  "./icons/favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./assets/aramaic.jpg",
  "./js/app.js",
  "./js/i18n.js",
  "./js/pwa-install.js",
  "./js/seeds.js",
  "./js/store.js",
  "./js/auth.js",
  "./js/supabase.js",
  "./js/ui.js",
  "./js/router.js",
  "./js/views/login.js",
  "./js/views/create-user.js",
  "./js/views/home.js",
  "./js/views/library.js",
  "./js/views/area.js",
  "./js/views/detail.js",
  "./js/views/admin.js",
  "./js/views/profile.js"
];

const FONT_HOSTS = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isFontRequest(url) {
  return FONT_HOSTS.some((host) => url.origin === host || url.href.startsWith(host));
}

async function fetchWithFallback(request) {
  const cache = await caches.open(CACHE_NAME);

  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) {
    fetch(request)
      .then((live) => {
        if (live && live.ok) cache.put(request, live);
      })
      .catch(() => {});
    return cached;
  }

  try {
    const live = await fetch(request);
    if (live && live.ok && (live.type === "basic" || live.type === "cors")) {
      cache.put(request, live.clone());
    }
    return live;
  } catch (err) {
    if (request.mode === "navigate") {
      const shell = await cache.match("./");
      if (shell) return shell;
    }
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !isFontRequest(url)) return;

  event.respondWith(fetchWithFallback(request));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
