export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
const sessionKeys = ["bookapp.access", "bookapp.refresh", "bookapp.username"] as const;
let version = 0;
let refreshPromise: { version: number; promise: Promise<boolean> } | null = null;
export const SESSION_EVENT = "cradle:session-changed";
export function sessionVersion() { return version; }
export function hasCredentials() { return typeof window !== "undefined" && Boolean(sessionStorage.getItem(sessionKeys[0]) || sessionStorage.getItem(sessionKeys[1])); }
export function clearSession(destination?: "/" | "/?logout=local") {
  version++;
  if (typeof window === "undefined") return;
  sessionKeys.forEach(key => sessionStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: destination }));
}
export function storeSession(access: string, refresh: string, username: string) {
  version++;
  sessionStorage.setItem(sessionKeys[0], access);
  sessionStorage.setItem(sessionKeys[1], refresh);
  sessionStorage.setItem(sessionKeys[2], username);
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function getRefreshToken() { return sessionStorage.getItem(sessionKeys[1]); }
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "ApiError"; }
}
export function isObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

async function send(path: string, init: RequestInit = {}) {
  try {
    return await fetch(`${API_BASE_URL}${path}`, { ...init, cache: "no-store", signal: init.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000) });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError("We couldn’t reach Cradle. Please check your connection and try again.", 0);
  }
}
async function read(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  let payload: unknown;
  try { payload = await response.json(); }
  catch { throw new ApiError("Cradle returned an unexpected response. Please try again.", response.status); }
  if (!response.ok) {
    if (isObject(payload)) {
      const message = payload.message ?? payload.error ?? payload.detail;
      if (typeof message === "string") throw new ApiError(message, response.status);
      const errors = Object.entries(payload).filter(([, value]) => typeof value === "string" || Array.isArray(value))
        .map(([key, value]) => `${key.replaceAll("_", " ")}: ${Array.isArray(value) ? value.join(" ") : value}`);
      if (errors.length) throw new ApiError(errors.join(" "), response.status);
    }
    throw new ApiError("We couldn’t complete that request. Please try again.", response.status);
  }
  return payload;
}
async function refreshAccess() {
  if (refreshPromise?.version === version) return refreshPromise.promise;
  const snapshot = version;
  const refresh = getRefreshToken();
  if (!refresh) { clearSession(); return false; }
  const promise = (async () => {
    const response = await send("/api/auth/token/refresh/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh }) });
    if (snapshot !== version) return false;
    if (response.status === 400 || response.status === 401) { clearSession(); return false; }
    const data = await read(response);
    if (snapshot !== version) return false;
    if (!isObject(data) || typeof data.access !== "string" || !data.access) { clearSession(); return false; }
    sessionStorage.setItem(sessionKeys[0], data.access);
    if (typeof data.refresh === "string" && data.refresh) sessionStorage.setItem(sessionKeys[1], data.refresh);
    return true;
  })().finally(() => { if (refreshPromise?.version === snapshot) refreshPromise = null; });
  refreshPromise = { version: snapshot, promise };
  return promise;
}

export async function apiRequest(path: string, init: RequestInit = {}, authenticated = false): Promise<unknown> {
  const snapshot = version;
  const makeRequest = () => {
    const headers = new Headers(init.headers);
    if (init.body) headers.set("Content-Type", "application/json");
    if (authenticated) {
      const access = sessionStorage.getItem(sessionKeys[0]);
      if (access) headers.set("Authorization", `Bearer ${access}`);
    }
    return send(path, { ...init, headers });
  };
  let response = await makeRequest();
  if (authenticated && response.status === 401) {
    if (snapshot !== version) throw new ApiError("Your session changed. Please try again.", 401);
    if (await refreshAccess()) response = await makeRequest();
    else throw new ApiError("Your session has expired. Please log in again.", 401);
    if (response.status === 401) clearSession();
  }
  if (authenticated && snapshot !== version) throw new ApiError("Your session changed. Please log in again.", 401);
  return read(response);
}
