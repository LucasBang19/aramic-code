import {
  SEED_MEMBERS,
  SEED_ITEMS,
  SEED_AREAS,
  defaultEnrollments,
  assignAreaToItem,
  MAIN_MODULE_ID
} from "./seeds.js";
import { DEFAULT_LANG } from "./i18n.js";
import { supabase } from "./supabase.js";

const KEYS = {
  members: "ac_members_v1",
  content: "ac_content_v2",
  areas: "ac_areas_v2",
  session: "ac_session_v1",
  lang: "ac_lang_v1",
  seeded: "ac_seeded_v4",
  completed: "ac_completed_lessons_v1",
  streak: "ac_streak_data_v1"
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
  write(KEYS.lang, DEFAULT_LANG);
  recordActivity();
}

function migrate() {
  // Always load fresh 5 canonical products and lessons
  write(KEYS.areas, SEED_AREAS);
  write(KEYS.content, SEED_ITEMS);

  const members = read(KEYS.members, SEED_MEMBERS);
  const updatedMembers = members.map((m) => {
    if (!Array.isArray(m.enrollments) || m.enrollments.length === 0) {
      return { ...m, enrollments: defaultEnrollments(m) };
    }
    const cleaned = m.enrollments.filter((id) => id !== "a-aramaic-code-bonus");
    return { ...m, enrollments: cleaned.length ? cleaned : [MAIN_MODULE_ID] };
  });
  write(KEYS.members, updatedMembers);
}

/* =========================================================================
   MEMBERS
   ========================================================================= */

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
    enrollments: Array.isArray(data.enrollments) && data.enrollments.length > 0
      ? data.enrollments
      : [MAIN_MODULE_ID],
    joined: now,
    lastLogin: now,
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
    ? enrollments.includes(areaId)
      ? enrollments
      : [...enrollments, areaId]
    : enrollments.filter((id) => id !== areaId);
  members[idx] = { ...member, enrollments: next };
  saveMembers(members);
  return true;
}

/* =========================================================================
   CONTENT (LESSONS)
   ========================================================================= */

export function getContent() {
  return read(KEYS.content, SEED_ITEMS);
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

/* =========================================================================
   AREAS (MODULES / PRODUCTS)
   ========================================================================= */

export function getAreas() {
  const areas = read(KEYS.areas, undefined);
  const rawList = Array.isArray(areas) && areas.length > 0 ? areas : SEED_AREAS;
  const areaMap = new Map(rawList.map((a) => [a.id, a]));

  // Always guarantee all 5 canonical products are present in order
  const result = SEED_AREAS.map((seedArea) => {
    const existing = areaMap.get(seedArea.id);
    return existing
      ? {
          ...seedArea,
          ...existing,
          productType: existing.productType || seedArea.productType || "main",
          checkoutUrl: existing.checkoutUrl || seedArea.checkoutUrl || ""
        }
      : seedArea;
  });

  // Include any custom areas created by the admin (excluding legacy duplicates)
  for (const [id, a] of areaMap) {
    if (!SEED_AREAS.some((s) => s.id === id) && id !== "a-aramaic-code-bonus") {
      result.push(a);
    }
  }

  return result;
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
  const created = {
    ...data,
    id: uid("a-"),
    productType: data.productType || "main",
    checkoutUrl: data.checkoutUrl || "",
    createdAt: now,
    updatedAt: now
  };
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

/* =========================================================================
   ACCESS & LOCKED MODULE LOGIC
   ========================================================================= */

export function canAccessArea(user, areaId) {
  if (!user) return false;
  if (user.role === "owner") return true;
  return Array.isArray(user.enrollments) && user.enrollments.includes(areaId);
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

export function getAllAreasWithAccess(user) {
  const areas = getAreas();
  return areas.map((area) => {
    const isAccessible = canAccessArea(user, area.id);
    return {
      ...area,
      isAccessible,
      isLocked: !isAccessible
    };
  });
}

export function getAccessibleItems(user) {
  const items = getContent();
  if (!user || user.role === "owner") return items;
  const ids = new Set(user.enrollments || []);
  return items.filter((i) => ids.has(i.areaId));
}

/* =========================================================================
   GAMIFICATION: PROGRESS, STREAK & PROSPERITY AWAKENING
   ========================================================================= */

export function getCompletedLessons() {
  return read(KEYS.completed, []);
}

export function isLessonCompleted(lessonId) {
  return getCompletedLessons().includes(lessonId);
}

export function setLessonCompleted(lessonId, completed = true) {
  const list = getCompletedLessons();
  const exists = list.includes(lessonId);
  const item = getItem(lessonId);
  const moduleId = (item && item.areaId) || MAIN_MODULE_ID;
  const session = getSession();
  const userId = session && session.member ? session.member.id : null;

  if (completed && !exists) {
    const updated = [...list, lessonId];
    write(KEYS.completed, updated);
    incrementDailyStreak();
    emit("progress", { lessonId, completed: true });

    // Track activity in Supabase
    if (userId) {
      supabase
        .from("user_progress")
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            module_id: moduleId,
            completed: true,
            last_listened_at: new Date().toISOString()
          },
          { onConflict: "user_id,lesson_id" }
        )
        .then(() => {})
        .catch((err) => console.warn("[store] progress sync err:", err));

      trackUserActivity("lesson_mastered", lessonId, moduleId, {
        lessonTitle: item ? item.title : lessonId
      });
    }

    return true;
  }

  if (!completed && exists) {
    const updated = list.filter((id) => id !== lessonId);
    write(KEYS.completed, updated);
    emit("progress", { lessonId, completed: false });

    if (userId) {
      supabase
        .from("user_progress")
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            module_id: moduleId,
            completed: false,
            last_listened_at: new Date().toISOString()
          },
          { onConflict: "user_id,lesson_id" }
        )
        .then(() => {})
        .catch((err) => console.warn("[store] progress sync err:", err));

      trackUserActivity("lesson_unmastered", lessonId, moduleId, {
        lessonTitle: item ? item.title : lessonId
      });
    }

    return false;
  }
  return exists;
}

export function toggleLessonCompleted(lessonId) {
  const state = isLessonCompleted(lessonId);
  return setLessonCompleted(lessonId, !state);
}

export async function trackUserActivity(eventType, lessonId = null, moduleId = null, metadata = {}) {
  try {
    const session = getSession();
    if (!session || !session.member || !session.member.id) return;
    const userId = session.member.id;

    // Asynchronously insert log into Supabase
    supabase
      .from("user_activity_logs")
      .insert({
        user_id: userId,
        event_type: eventType,
        lesson_id: lessonId,
        module_id: moduleId,
        metadata: {
          ...metadata,
          path: window.location.hash || window.location.pathname,
          userAgent: navigator.userAgent
        }
      })
      .then(({ error }) => {
        if (error) console.warn("[tracking] user_activity_log err:", error.message);
      })
      .catch((err) => console.warn("[tracking] network err:", err));

    // Update profile last_active_at
    supabase
      .from("profiles")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", userId)
      .then(() => {})
      .catch(() => {});
  } catch (err) {
    console.warn("[tracking] error:", err);
  }
}

export async function syncUserProgressRemote(userId) {
  if (!userId) return;
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("lesson_id, completed")
      .eq("user_id", userId)
      .eq("completed", true);

    if (error) {
      console.warn("[supabase] error loading user progress:", error.message);
      return;
    }

    if (Array.isArray(data)) {
      const remoteCompleted = data.map((r) => r.lesson_id);
      const localCompleted = getCompletedLessons();
      const merged = Array.from(new Set([...localCompleted, ...remoteCompleted]));
      write(KEYS.completed, merged);
      emit("progress", { synced: true, count: merged.length });
    }
  } catch (err) {
    console.warn("[supabase] syncUserProgressRemote err:", err);
  }
}

export function getStreakData() {
  const fallback = {
    currentStreak: 1,
    bestStreak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    lastCompletedDate: null,
    daysInactive: 0
  };
  return read(KEYS.streak, fallback);
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function recordActivity() {
  const streak = getStreakData();
  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  if (!streak.lastActiveDate) {
    streak.lastActiveDate = today;
    streak.currentStreak = 1;
    streak.daysInactive = 0;
    write(KEYS.streak, streak);
    return streak;
  }

  const lastActive = new Date(streak.lastActiveDate);
  const now = new Date(today);
  const diffTime = Math.abs(now - lastActive);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  streak.daysInactive = diffDays;

  if (streak.lastActiveDate === today) {
    // Already recorded today
    write(KEYS.streak, streak);
    return streak;
  }

  if (streak.lastActiveDate === yesterday) {
    // Active yesterday, so streak remains alive!
    streak.lastActiveDate = today;
    streak.daysInactive = 0;
  } else if (diffDays > 1) {
    // Inactive for more than 1 day: reset streak to 1 to incentivize restarting
    streak.currentStreak = 1;
    streak.lastActiveDate = today;
    streak.daysInactive = diffDays;
  }

  write(KEYS.streak, streak);
  emit("streak", streak);
  return streak;
}

export function incrementDailyStreak() {
  const streak = getStreakData();
  const today = getTodayStr();

  if (streak.lastCompletedDate !== today) {
    streak.currentStreak = (streak.currentStreak || 0) + 1;
    if (streak.currentStreak > (streak.bestStreak || 0)) {
      streak.bestStreak = streak.currentStreak;
    }
    streak.lastCompletedDate = today;
    streak.lastActiveDate = today;
    streak.daysInactive = 0;
    write(KEYS.streak, streak);
    emit("streak", streak);
  }
  return streak;
}

export function getJourneyProgress(user) {
  const accessibleItems = getAccessibleItems(user);
  const completedList = getCompletedLessons();
  const completedCount = accessibleItems.filter((i) =>
    completedList.includes(i.id)
  ).length;
  const totalLessons = accessibleItems.length || 1;
  const percent = Math.min(
    100,
    Math.round((completedCount / totalLessons) * 100)
  );

  // Prioritize uncompleted audio frequencies to listen next
  const nextLesson =
    accessibleItems.find((i) => i.type === "audio" && !completedList.includes(i.id)) ||
    accessibleItems.find((i) => !completedList.includes(i.id)) ||
    accessibleItems[0] ||
    null;

  return {
    totalLessons: accessibleItems.length,
    completedCount,
    percent,
    nextLesson
  };
}

/* =========================================================================
   REMOTE SUPABASE SYNC
   ========================================================================= */

export async function syncRemote(userId) {
  if (!userId) return false;

  const [modulesResult, lessonsResult, accessResult] = await Promise.all([
    supabase.from("modules").select("*").order("sort_order", { ascending: true }),
    supabase.from("lessons").select("*").order("sort_order", { ascending: true }),
    supabase.from("module_access").select("module_id").eq("user_id", userId)
  ]);

  if (modulesResult.error || lessonsResult.error || accessResult.error) {
    console.warn(
      "[supabase] content sync failed",
      modulesResult.error || lessonsResult.error || accessResult.error
    );
    return false;
  }

  const remoteAreasMap = new Map((modulesResult.data || []).map((m) => [m.id, m]));
  const areas = SEED_AREAS.map((seedArea) => {
    const remote = remoteAreasMap.get(seedArea.id);
    return {
      ...seedArea,
      title: (remote && remote.title) || seedArea.title,
      description: (remote && remote.description) || seedArea.description,
      cover: (remote && remote.cover) || seedArea.cover,
      productType: (remote && remote.product_type) || seedArea.productType || "main",
      checkoutUrl: (remote && remote.checkout_url) || seedArea.checkoutUrl || "",
      isRemote: !!remote
    };
  });
  for (const [id, m] of remoteAreasMap) {
    if (!SEED_AREAS.some((s) => s.id === id) && id !== "a-aramaic-code-bonus") {
      areas.push({
        id: m.id,
        title: m.title,
        description: m.description || "",
        cover: m.cover || "",
        productType: m.product_type || "main",
        checkoutUrl: m.checkout_url || "",
        createdAt: m.created_at,
        isRemote: true
      });
    }
  }

  const remoteLessons = new Map(
    (lessonsResult.data || []).map((lesson) => [lesson.id, lesson])
  );

  const localCourseLessons = SEED_ITEMS.map((seed) => {
    const remote = remoteLessons.get(seed.id);
    return {
      ...seed,
      title: (remote && remote.title) || seed.title,
      description: (remote && remote.description) || seed.description,
      createdAt: (remote && remote.created_at) || seed.createdAt,
      isRemote: !!remote
    };
  });

  const seededIds = new Set(SEED_ITEMS.map((seed) => seed.id));
  const items = [
    ...localCourseLessons,
    ...(lessonsResult.data || [])
      .filter(
        (lesson) => !seededIds.has(lesson.id) && lesson.id !== "lesson-day-7"
      )
      .map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || "",
        type: lesson.type || "video",
        url: lesson.url || "",
        category: lesson.category || "teaching",
        tags: Array.isArray(lesson.tags) ? lesson.tags : [],
        thumbnail: lesson.thumbnail || "",
        duration: lesson.duration || 0,
        areaId: lesson.module_id,
        createdAt: lesson.created_at,
        isRemote: true
      }))
  ];

  const enrollments = (accessResult.data || []).map((row) => row.module_id);
  const members = getMembers();
  const member = members.find((item) => item.id === userId);
  if (member) {
    saveMembers(
      members.map((item) =>
        item.id === userId
          ? { ...item, enrollments, language: DEFAULT_LANG }
          : item
      )
    );
  }

  write(KEYS.areas, areas.length ? areas : SEED_AREAS);
  write(KEYS.content, items);
  emit("areas");
  emit("content");

  // Sync user progress (completed frequencies) from Supabase
  await syncUserProgressRemote(userId);
  return true;
}

/* =========================================================================
   SESSION & LANGUAGE
   ========================================================================= */

export function getSession() {
  return read(KEYS.session, null);
}

export function setSession(session) {
  if (session) write(KEYS.session, session);
  else localStorage.removeItem(KEYS.session);
  emit("session");
}

export function getLanguage() {
  return DEFAULT_LANG;
}

export function setLanguage() {
  write(KEYS.lang, DEFAULT_LANG);
  emit("language", DEFAULT_LANG);
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  emit("reset");
}

export { uid };
