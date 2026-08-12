import * as store from "./store.js";
import { supabase } from "./supabase.js";

export async function login(email, password) {
  const emailNorm = String(email || "").trim().toLowerCase();
  if (!emailNorm || !password) return { ok: false, error: "required" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailNorm,
    password
  });
  if (error || !data.user) return { ok: false, error: "wrongCreds" };

  return finishRemoteLogin(data.user);
}

export async function register(email, password) {
  const emailValue = String(email || "").trim();
  const passwordValue = String(password || "");
  if (!emailValue || !passwordValue) return { ok: false, error: "required" };

  const { data, error } = await supabase.auth.signUp({
    email: emailValue,
    password: passwordValue,
    options: { data: { first_name: emailValue.split("@")[0] || "Member" } }
  });
  if (error) {
    return {
      ok: false,
      error: error.message && /already|registered|exists/i.test(error.message) ? "exists" : "generic"
    };
  }
  if (!data.user || !data.session) return { ok: false, error: "confirmEmail" };

  return finishRemoteLogin(data.user);
}

async function finishRemoteLogin(user) {
  const member = await loadMember(user);
  if (!member) return { ok: false, error: "database" };

  cacheMember(member);
  store.setSession(createSession(member));
  await store.syncRemote(member.id);
  return { ok: true, member, session: store.getSession() };
}

async function loadMember(user) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,first_name,last_name,role,language")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("[supabase] profile lookup failed", profileError);
    return null;
  }

  let source = profile;
  if (!source) {
    const profileDraft = {
      id: user.id,
      email: user.email || "",
      first_name: (user.email || "Member").split("@")[0],
      last_name: "",
      role: "member",
      language: "en"
    };
    const { data: createdProfile, error: createProfileError } = await supabase
      .from("profiles")
      .upsert(profileDraft, { onConflict: "id" })
      .select("id,email,first_name,last_name,role,language")
      .single();
    if (createProfileError) {
      console.error("[supabase] profile creation failed", createProfileError);
      return null;
    }
    source = createdProfile;
  }

  let { data: access, error: accessError } = await supabase
    .from("module_access")
    .select("module_id")
    .eq("user_id", user.id);
  if (accessError) {
    console.error("[supabase] access lookup failed", accessError);
    return null;
  }

  if (!access || access.length === 0) {
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id");
    if (modulesError) {
      console.error("[supabase] module lookup failed", modulesError);
      return null;
    }
    const rows = (modules || []).map((module) => ({
      user_id: user.id,
      module_id: module.id
    }));
    if (rows.length) {
      const { error: accessInsertError } = await supabase
        .from("module_access")
        .upsert(rows, { onConflict: "user_id,module_id" });
      if (accessInsertError) {
        console.error("[supabase] module access creation failed", accessInsertError);
        return null;
      }
      access = rows.map((row) => ({ module_id: row.module_id }));
    }
  }

  return {
    id: source.id,
    email: source.email || user.email || "",
    username: (source.email || user.email || "member").split("@")[0],
    password: "",
    role: source.role || "member",
    firstName: source.first_name || "",
    lastName: source.last_name || "",
    joined: source.created_at || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    language: "en",
    enrollments: (access || []).map((row) => row.module_id)
  };
}

function cacheMember(member) {
  const members = store.getMembers().filter((item) => item.id !== member.id);
  store.saveMembers([...members, member]);
}

function createSession(member) {
  return {
    userId: member.id,
    email: member.email,
    role: member.role,
    name: [member.firstName, member.lastName].filter(Boolean).join(" "),
    loggedInAt: new Date().toISOString()
  };
}

export async function restoreSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session || !data.session.user) {
    store.setSession(null);
    return null;
  }
  const result = await finishRemoteLogin(data.session.user);
  if (!result.ok) {
    store.setSession(null);
    return null;
  }
  return result.member;
}

export async function logout() {
  await supabase.auth.signOut();
  store.setSession(null);
}

export function currentUser() {
  const session = store.getSession();
  if (!session) return null;
  const member = store.getMembers().find((item) => item.id === session.userId);
  return member ? { ...member, ...session } : null;
}

export function isOwner() {
  const user = currentUser();
  return !!user && user.role === "owner";
}

export function isAuthed() {
  return !!currentUser();
}
