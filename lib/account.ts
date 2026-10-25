import { apiRequest, isObject } from "./http";
export type AccountProfile = { Email: string; Username: string; username: string; Phone: string; Country: string; Address: string; Favourite_genres: string[]; privacy: "public" | "private"; updated_at: string };
export type ProfileChanges = Partial<Pick<AccountProfile, "Username" | "Phone" | "Country" | "Address" | "Favourite_genres" | "privacy">>;
function readProfile(data: unknown): AccountProfile {
  if (!isObject(data) || !isObject(data.profile)) throw new Error("The account response has an unexpected format.");
  const profile = data.profile;
  if (!["Email", "Username", "username", "Phone", "Country", "Address", "updated_at"].every(key => typeof profile[key] === "string") || !Array.isArray(profile.Favourite_genres) || !profile.Favourite_genres.every(item => typeof item === "string") || !["public", "private"].includes(String(profile.privacy))) throw new Error("The account profile has an unexpected format.");
  return profile as AccountProfile;
}
export async function fetchAccountProfile() { return readProfile(await apiRequest("/api/auth/profile/", {}, true)); }
export async function updateAccountProfile(changes: ProfileChanges) { return readProfile(await apiRequest("/api/auth/profile/", { method: "PATCH", body: JSON.stringify(changes) }, true)); }
export async function fetchGenres(): Promise<{ key: string; name: string }[]> {
  const data = await apiRequest("/api/auth/genres/");
  if (!isObject(data) || !Array.isArray(data.genres)) throw new Error("Reading interests couldn’t load.");
  return data.genres.map(item => {
    if (!isObject(item) || typeof item.key !== "string" || typeof item.name !== "string") throw new Error("A genre has an unexpected format.");
    return { key: item.key, name: item.name };
  });
}
export async function changePassword(oldPassword: string, newPassword: string, confirmation: string) {
  return apiRequest("/api/auth/change-password/", { method: "POST", body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmation }) }, true);
}
export async function fetchConnections() {
  const data = await apiRequest("/api/auth/follows/", {}, true);
  if (!isObject(data) || !Array.isArray(data.followers) || !Array.isArray(data.following)) throw new Error("Your connections couldn’t load.");
  return { followers: data.followers.length, following: data.following.length };
}
