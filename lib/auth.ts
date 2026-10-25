import { apiRequest, clearSession, getRefreshToken, isObject, storeSession } from "./http";
const verificationEmailKey = "cradle.signup-email";

const request = (path: string, body: Record<string, string>) => apiRequest(`/api/auth/${path}/`, { method: "POST", body: JSON.stringify(body) });

export async function signIn(username: string, password: string) {
  const data = await request("login", { Username: username, Password: password });
  if (!isObject(data) || typeof data.access !== "string" || !data.access || typeof data.refresh !== "string" || !data.refresh) {
    throw new Error("Sign-in could not be completed. Please try again.");
  }
  storeSession(data.access, data.refresh, typeof data.username === "string" ? data.username : username);
}

export async function signUp(username: string, email: string, password: string, confirmation: string) {
  await request("signup", { Username: username, Email: email, Password: password, Confirm_Password: confirmation });
  // The signup response's Email field is a literal placeholder; preserve the submitted address.
  sessionStorage.setItem(verificationEmailKey, email);
}

export function pendingEmail() { return sessionStorage.getItem(verificationEmailKey) ?? ""; }

export async function verifyEmail(email: string, otp: string) {
  await request("verify-otp", { Email: email, OTP: otp });
  sessionStorage.removeItem(verificationEmailKey);
}

export async function signOut() {
  let completed = false;
  // Refresh first if required; the refresh token may rotate, so read it again after that.
  try {
    await apiRequest("/api/books/profile/", {}, true);
    const refresh = getRefreshToken();
    if (refresh) await apiRequest("/api/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) }, true);
    completed = true;
  } finally { clearSession(completed ? "/" : "/?logout=local"); }
}
