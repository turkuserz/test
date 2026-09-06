import { KEYAUTH } from "./keyauth-config.js";

let sessionid = null;

async function api(data) {
  const body = new URLSearchParams(data);
  const res = await fetch(KEYAUTH.url, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body
  });
  if (!res.ok) throw new Error("KeyAuth connection failed");
  const json = await res.json();
  if (json.ownerid && json.ownerid !== KEYAUTH.ownerid) {
    throw new Error("Invalid KeyAuth application");
  }
  return json;
}

export async function initKeyAuth() {
  const r = await api({
    type: "init",
    ver: KEYAUTH.version,
    name: KEYAUTH.name,
    ownerid: KEYAUTH.ownerid
  });
  if (!r.success) throw new Error(r.message || "KeyAuth initialization failed");
  sessionid = r.sessionid;
  return r;
}

export async function loginWithKeyAuth(username, password) {
  if (!username || !password) throw new Error("กรุณากรอก Username และ Password");
  await initKeyAuth();

  const r = await api({
    type: "login",
    username,
    pass: password,
    sessionid,
    name: KEYAUTH.name,
    ownerid: KEYAUTH.ownerid
  });

  if (!r.success) throw new Error(r.message || "Invalid username or password");

  sessionStorage.setItem("bastien_keyauth_session", JSON.stringify({
    username: r.info?.username || username,
    sessionid: r.sessionid || sessionid
  }));
  sessionid = r.sessionid || sessionid;
  return r;
}

export async function checkKeyAuthSession() {
  const raw = sessionStorage.getItem("bastien_keyauth_session");
  if (!raw) return false;

  try {
    const saved = JSON.parse(raw);
    await initKeyAuth();
    sessionid = saved.sessionid || sessionid;

    const r = await api({
      type: "check",
      sessionid,
      name: KEYAUTH.name,
      ownerid: KEYAUTH.ownerid
    });

    if (!r.success) {
      sessionStorage.removeItem("bastien_keyauth_session");
      return false;
    }
    return true;
  } catch {
    sessionStorage.removeItem("bastien_keyauth_session");
    return false;
  }
}

export async function logoutKeyAuth() {
  const raw = sessionStorage.getItem("bastien_keyauth_session");
  try {
    if (raw && sessionid) {
      await api({
        type: "logout",
        sessionid,
        name: KEYAUTH.name,
        ownerid: KEYAUTH.ownerid
      });
    }
  } catch {}
  sessionStorage.removeItem("bastien_keyauth_session");
  sessionid = null;
}

export function getKeyAuthUser() {
  try {
    return JSON.parse(sessionStorage.getItem("bastien_keyauth_session") || "null");
  } catch {
    return null;
  }
}
