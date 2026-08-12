import * as store from "./store.js";

export function login(email, password) {
  const emailNorm = (email || "").trim().toLowerCase();
  if (!emailNorm || !password) {
    return { ok: false, error: "required" };
  }
  const members = store.getMembers();
  const member = members.find(
    (m) => m.email.toLowerCase() === emailNorm
  );
  if (!member || member.password !== password) {
    return { ok: false, error: "wrongCreds" };
  }
  const session = createSession(member);
  const updated = members.map((m) =>
    m.id === member.id
      ? { ...m, lastLogin: new Date().toISOString(), language: "en" }
      : m
  );
  store.saveMembers(updated);
  store.setSession(session);
  return { ok: true, member, session };
}

export function register(email, password) {
  const emailValue = String(email || "").trim();
  const passwordValue = String(password || "");
  if (!emailValue || !passwordValue) {
    return { ok: false, error: "required" };
  }

  const exists = store
    .getMembers()
    .some((member) => member.email.toLowerCase() === emailValue.toLowerCase());
  if (exists) return { ok: false, error: "exists" };

  const member = store.upsertMember({
    email: emailValue,
    username: emailValue.split("@")[0] || emailValue,
    password: passwordValue,
    firstName: emailValue.split("@")[0] || "Member",
    lastName: "",
    language: "en"
  });
  if (!member) return { ok: false, error: "generic" };

  const session = createSession(member);
  store.setSession(session);
  return { ok: true, member, session };
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

export function logout() {
  store.setSession(null);
}

export function currentUser() {
  const session = store.getSession();
  if (!session) return null;
  const member = store.getMembers().find((m) => m.id === session.userId);
  if (!member) return null;
  return { ...member, ...session };
}

export function isOwner() {
  const user = currentUser();
  return !!user && user.role === "owner";
}

export function isAuthed() {
  return !!currentUser();
}
