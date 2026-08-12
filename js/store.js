import {
  SEED_MEMBERS,
  SEED_ITEMS,
  SEED_AREAS,
  defaultEnrollments,
  assignAreaToItem
} from "./seeds.js";
import { DEFAULT_LANG } from "./i18n.js";

const KEYS = {
  members: "ac_members_v1",
  content: "ac_content_v1",
  areas: "ac_areas_v1",
  session: "ac_session_v1",
  lang: "ac_lang_v1",
  seeded: "ac_seeded_v2"
};

const listeners = new Set();

function emit(event, data) {
  for (const cb of listeners) cb(event, data);
}

export function onChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("[store] write failed", err);
  }
}

function uid(prefix) {
  return (
    prefix +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

export function boot() {
  if (!localStorage.getItem(KEYS.seeded)) {
    write(KEYS.members, SEED_MEMBERS);
    write(KEYS.content, SEED_ITEMS);
    write(KEYS.areas, SEED_AREAS);
    localStorage.setItem(KEYS.seeded, "1");
  } else {
    migrate();
  }
  // This release is English-only. Reset an older language preference as part
  // of the content migration so an existing browser cannot render stale copy.
  if (getLanguage() !== DEFAULT_LANG) write(KEYS.lang, DEFAULT_LANG);
}

function migrate() {
  const areas = read(KEYS.areas, undefined);
  if (areas === undefined) {
    write(KEYS.areas, SEED_AREAS);
  }

  const members = read(KEYS.members, SEED_MEMBERS);
  const hasMemberChange = members.some((m) => !Array.isArray(m.enrollments));
  if (hasMemberChange) {
    write(
      KEYS.members,
      members.map((m) =>
        Array.isArray(m.enrollments) ? m : { ...m, enrollments: defaultEnrollments(m) }
      )
    );
  }

  const items = read(KEYS.content, []);
  const hasItemChange = items.some((i) => !i.areaId);
  if (hasItemChange) {
    write(
      KEYS.content,
      items.map((i) => (i.areaId ? i : { ...i, areaId: assignAreaToItem(i) }))
    );
  }
}

/* ---------- Members ---------- */

export function getMembers() {
  return read(KEYS.members, SEED_MEMBERS);
}

export function getMemberById(id) {
  return getMembers().find((m) => m.id === id) || null;
}

export function saveMembers(members) {
  write(KEYS.members, members);
  emit("members");
}

export function upsertMember(data) {
  const members = getMembers();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = members.findIndex((m) => m.id === data.id);
    if (idx === -1) return null;
    const updated = { ...members[idx], ...data, updatedAt: now };
    members[idx] = updated;
    saveMembers(members);
    return updated;
  }
  const created = {
    ...data,
    id: uid("m-"),
    role: "member",
    enrollments: Array.isArray(data.enrollments)
      ? data.enrollments
      : getAreas().map((area) => area.id),
    joined: now,
    lastLogin: "",
    updatedAt: now
  };
  members.push(created);
  saveMembers(members);
  return created;
}

export function deleteMember(id) {
  const members = getMembers().filter((m) => m.id !== id);
  saveMembers(members);
  return true;
}

export function setMemberEnrollment(memberId, areaId, granted) {
  const members = getMembers();
  const idx = members.findIndex((m) => m.id === memberId);
  if (idx === -1) return false;
  const member = members[idx];
  if (member.role === "owner") return false;
  const enrollments = Array.isArray(member.enrollments) ? member.enrollments : [];
  const next = granted
    ? enrollments.includes(areaId) ? enrollments : [...enrollments, areaId]
    : enrollments.filter((id) => id !== areaId);
  members[idx] = { ...member, enrollments: next };
  saveMembers(members);
  return true;
}

/* ---------- Content ---------- */

export function getContent() {
  return read(KEYS.content, []);
}

export function getItem(id) {
  return getContent().find((item) => item.id === id) || null;
}

export function upsertItem(data) {
  const items = getContent();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = items.findIndex((i) => i.id === data.id);
    if (idx === -1) return null;
    const updated = { ...items[idx], ...data, updatedAt: now };
    items[idx] = updated;
    write(KEYS.content, items);
    emit("content", { id: updated.id });
    return updated;
  }
  const created = { ...data, id: uid("c-"), createdAt: now, updatedAt: now };
  items.unshift(created);
  write(KEYS.content, items);
  emit("content", { id: created.id });
  return created;
}

export function deleteItem(id) {
  const items = getContent().filter((i) => i.id !== id);
  write(KEYS.content, items);
  emit("content", { id });
  return true;
}

/* ---------- Areas (courses) ---------- */

export function getAreas() {
  const areas = read(KEYS.areas, undefined);
  return Array.isArray(areas) ? areas : SEED_AREAS;
}

export function getArea(id) {
  return getAreas().find((a) => a.id === id) || null;
}

export function saveAreas(areas) {
  write(KEYS.areas, areas);
  emit("areas");
}

export function upsertArea(data) {
  const areas = getAreas();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = areas.findIndex((a) => a.id === data.id);
    if (idx === -1) return null;
    const updated = { ...areas[idx], ...data, updatedAt: now };
    areas[idx] = updated;
    saveAreas(areas);
    return updated;
  }
  const created = { ...data, id: uid("a-"), createdAt: now, updatedAt: now };
  areas.push(created);
  saveAreas(areas);
  return created;
}

export function deleteArea(id) {
  const areas = getAreas().filter((a) => a.id !== id);
  saveAreas(areas);
  const items = getContent().map((i) =>
    i.areaId === id ? { ...i, areaId: "" } : i
  );
  write(KEYS.content, items);
  emit("content");
  return true;
}

/* ---------- Access ---------- */

export function canAccessArea(user, areaId) {
  if (!user) return false;
  if (user.role === "owner") return true;
  return (
    Array.isArray(user.enrollments) && user.enrollments.includes(areaId)
  );
}

export function canAccessItem(user, item) {
  if (!user) return false;
  if (user.role === "owner") return true;
  return canAccessArea(user, item && item.areaId);
}

export function getAccessibleAreas(user) {
  const areas = getAreas();
  if (!user || user.role === "owner") return areas;
  const ids = new Set(user.enrollments || []);
  return areas.filter((a) => ids.has(a.id));
}

export function getAccessibleItems(user) {
  const items = getContent();
  if (!user || user.role === "owner") return items;
  const ids = new Set(user.enrollments || []);
  return items.filter((i) => ids.has(i.areaId));
}

/* ---------- Session & language ---------- */

export function getSession() {
  return read(KEYS.session, null);
}

export function setSession(session) {
  if (session) write(KEYS.session, session);
  else localStorage.removeItem(KEYS.session);
  emit("session");
}

export function getLanguage() {
  return read(KEYS.lang, DEFAULT_LANG);
}

export function setLanguage(lang) {
  write(KEYS.lang, lang);
  emit("language", lang);
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  emit("reset");
}

export { uid };
