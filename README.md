# Members Ceramic — Members Portal (PWA)

A complete, no-build, installable PWA members area for **Members Ceramic**.
Mobile-first, mystical / biblical / aramaic aesthetic (dark + gold), built on the
design tokens in `../design/tokens.css` (styleboard v4.1 — Illuminated Manuscript,
polish pass).

## Polish pass (v7)

Premium polish + ceremonial motion, applied in place without a rebuild:

- **Typography** — tightened type scale with a clear H1/H2/H3 rhythm, tracked
  Cinzel letter-spacing on every caps treatment, and a Cormorant body sized and
  leaded (`1.7`) for comfortable mobile reading (weight bumped to 500).
- **Spacing & rhythm** — one scale drives paddings/margins across login, cards,
  library, detail/player, admin and profile; roomier `.view-pad` top and card bodies.
- **Cards & depth** — unified gold border weights, corner filigree sizing
  (`--filigree-size`) and shadow/rim depth across every panel; a gradient veil
  on course cover images keeps titles legible over any cover.
- **Login centerpiece** — ornate double-framed parchment card with outer + inner
  gold hairlines, corner filigree, a candlelight aura behind the card and a
  glowing crest.
- **Components** — refined inputs (inset depth, gold caret + focus ring), admin
  form labels lifted for contrast, a gold-ringed audio player with filigree
  corners, and empty/loading/error states styled as framed parchment panels.
- **Motion** (all wrapped in `prefers-reduced-motion: reduce`):
  - candle rim-glow gently *breathes* on primary CTAs and active/selected
    elements (buttons, chips, nav, language flags, segmented settings);
  - cards enter with a soft fade + rise, lightly staggered across a grid;
  - hover/press deepen the gold glow with a slight lift;
  - active bottom-nav item grows an animated gold line;
  - route changes crossfade through a warm parchment tint (see `js/router.js`).
- **Accessibility** — gold-on-dark text passes contrast on the parchment darks,
  and every interactive element keeps a visible `:focus-visible` ring.

Plain HTML + CSS + vanilla JS ES modules. No framework, no build step.
Data persists in `localStorage`. External links only (no backend).

## Run it

Serve the `app/` folder (service worker + ES modules need http):

```bash
cd aramaic-code-members/app
npx serve .
# or: python -m http.server 8080
# then open the printed URL (e.g. http://localhost:3000)
```

> Opening `index.html` via `file://` works for the HTML/CSS but browsers block
> ES-module imports over `file://` — always serve the folder. If that happens,
> the app shows a friendly notice pointing here.

## Accounts

Members create their own account from the portal. No email-format or password policy is enforced in this front-end prototype. New members automatically receive access to the available modules.

The Admin panel (`#/admin`, bottom-nav Admin) is hidden from normal members and is reserved for the administrator account that will be configured later.

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor before using the hosted
app. It creates the modules, lessons, profiles, access table, RLS policies and
the signup trigger that grants current modules to new members. The browser only
uses the public publishable key in `js/supabase.js`; never put a `service_role`
key in this repository, Vercel client code or any committed `.env` file.
For immediate access after signup, disable email confirmation in Supabase under
Authentication → Providers → Email; otherwise members must confirm their email.

## Member flow

1. **Create an account** → Home shows the available modules as cover cards. Open
   one to browse its lessons; the library is scoped to the member's access.
2. **Sign in as the administrator** → **Admin** has three tabs:
   - **Modules** — create / edit / delete modules (title, description, cover URL;
     invalid URLs and empty titles are rejected). Deleting keeps content but
     unassigns it.
   - **Content** — add / edit / delete content, now assigning each piece to a
     **Module** (required); the list filters by module.
   - **Members** — add a member (email, name, language) and grant/revoke each
      member's access to each module with toggles.
3. **Sign in as a member** after changing access → the available modules update
   on their Home.

## Features

- **Modules / Areas** — the library is organized into modules. Each module has a
  title, description and cover image; each lesson belongs to exactly one module
  (`areaId`).
- **Per-member access** — every member carries an `enrollments` list of area
  ids. They see **only** their areas as cover cards and can only open lessons
  inside them. The owner implicitly sees **all** areas and content. Deep links
  to forbidden content are guarded.
- **Home / Library** — after login, Home shows the member's modules as image
  cover cards. The Library filters by module, type and category and is scoped to
  the member's access.
- **Login** — "Enter the Portal"; wrong credentials show an inline error state.
- **Content Detail** — per-type player: video (YouTube/embed iframe), audio
  (`<audio>`), file (download), link (open). Category + tags.
- **Admin panel** — three-tab admin: Modules CRUD, Content CRUD (with module
  assignment + module filter), and Members & Access (add members, enrollment
  toggles).
- **Profile / Settings** — profile info and sign out.
- **English UI** — all visible interface copy and seeded content are in English.
- **PWA** — `manifest.json`, service worker with offline app-shell cache
  (`members-ceramic-shell-v13`), installable, SVG + PNG icons (Star of David
  inside a sacred-geometry ring).
- **Install prompt** — a themed bottom-sheet invite to add the app to the
  home screen. Android/Chromium use the native `beforeinstallprompt`; iOS gets
  Share-button instructions. See "Install prompt" below.
- **Initial content** — 2 modules with 15 lessons. New members receive access to
  both modules automatically. Existing installs are migrated to this content.

## Structure

```
app/
  index.html          app shell (app-bar, view, bottom-nav)
  manifest.json       PWA manifest
  sw.js               service worker (offline shell cache)
  css/tokens.css      vendored design tokens (canonical: ../design/tokens.css)
  css/app.css         full design system (components, states, motion)
  icons/              app icons (SVG + generated PNG)
  js/
    app.js            bootstrap + SW registration + file:// fallback notice
    i18n.js           English dictionary + helpers
    pwa-install.js    home-screen install prompt (bottom sheet / chip)
    seeds.js          2 seeded modules + 15 seeded lessons + no member accounts
    store.js          localStorage persistence + pub/sub + access helpers
    auth.js           login / logout / session / owner check
    ui.js             icons, logo, spinner, toast, modal, confirm, thumbnails, covers
    router.js         path/hash SPA router with auth + owner guards
    views/            login · create-user · home · library · area · detail · admin · profile
  vercel.json         rewrite for direct routes such as /create-user
  tools/
    generate-icons.ps1  regenerates icons/icon-*.png (PowerShell + System.Drawing)
```

## Install prompt

`js/pwa-install.js` shows a dark-gold, mobile-first bottom sheet inviting the
visitor to add Members Ceramic to their home screen. It behaves per platform:

- **Android / Chromium** — listens for `beforeinstallprompt`, calls
  `preventDefault()` and stashes the event. The sheet's **Install** button calls
  the stashed `prompt()` and resolves `userChoice`; on **Later** (or a failed
  prompt) the sheet closes.
- **iOS / Safari** — there is no `beforeinstallprompt`, so on iOS (and not
  standalone) the sheet shows the native-style Share glyph + *"Add to Home
  Screen"* instructions instead of an Install button.
- **Desktop** — only when Chromium fires `beforeinstallprompt`; a small
  unobtrusive install chip appears instead of the sheet.
- **Already installed** — hidden entirely when running standalone
  (`matchMedia('(display-mode: standalone)')` or `navigator.standalone`).
- **Dismissal memory** — stored under `localStorage.ac_pwa_install_v1`:
  tapping **Later**/close suppresses the prompt for 7 days; a successful
  install (or `appinstalled`) suppresses it forever.
- **Timing** — appears ~2.5s after `load`, with a slide-up animation, so it
  never interrupts first paint. All strings are in English.

For the Android install to work the manifest must be install-ready (name,
short_name, 192/512 + maskable icons, `start_url`, `display: standalone`,
`theme_color`) — it is, see `manifest.json`.

## Offline

After the first load the app shell (HTML, CSS, JS, icons, manifest) is cached
by the service worker and the app opens offline. Google Fonts are runtime-cached
when online. Content, session and language live in `localStorage` and are fully
offline. Lesson videos are external URLs and only play when online.

## Reset local data

Clear the site's `localStorage` (or DevTools → Application → Local Storage →
Clear), then reload. The initial modules and lessons are recreated on first boot.
