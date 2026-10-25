import { apiRequest, isObject } from "./http";
export type Connection = { id: number; userId: number; username: string; state: "pending" | "accepted" };
export type Reader = { id: number; username: string; privacy: "public" | "private"; followStatus: "none" | "pending" | "accepted"; followsYou: boolean };
export type Connections = { followers: Connection[]; following: Connection[]; outgoing: Connection[] };
function connection(value: unknown): Connection {
  if (!isObject(value) || typeof value.id !== "number" || typeof value.user_id !== "number" || typeof value.username !== "string" || !["pending", "accepted"].includes(String(value.state))) throw new Error("A connection has an unexpected format.");
  return { id: value.id, userId: value.user_id, username: value.username, state: value.state as Connection["state"] };
}
export async function fetchSocialConnections(): Promise<Connections> {
  const data = await apiRequest("/api/auth/follows/", {}, true);
  if (!isObject(data) || !Array.isArray(data.followers) || !Array.isArray(data.following)) throw new Error("Your connections couldn’t load.");
  return { followers: data.followers.map(connection), following: data.following.map(connection), outgoing: Array.isArray(data.outgoing_pending) ? data.outgoing_pending.map(connection) : [] };
}
export async function fetchFollowRequests() {
  const data = await apiRequest("/api/auth/follow-requests/", {}, true);
  if (!isObject(data) || !Array.isArray(data.pending)) throw new Error("Follow requests couldn’t load.");
  return data.pending.map(connection);
}
export async function searchReaders(username: string): Promise<Reader[]> {
  const data = await apiRequest(`/api/auth/users/?${new URLSearchParams({ username })}`, {}, true);
  if (!isObject(data) || !Array.isArray(data.results)) throw new Error("Reader search returned an unexpected response.");
  return data.results.map(value => {
    if (!isObject(value) || typeof value.id !== "number" || typeof value.username !== "string" || !["public", "private"].includes(String(value.privacy)) || !["none", "pending", "accepted"].includes(String(value.follow_status))) throw new Error("A reader has an unexpected format.");
    return { id: value.id, username: value.username, privacy: value.privacy as Reader["privacy"], followStatus: value.follow_status as Reader["followStatus"], followsYou: value.follows_you === true };
  });
}
export type FollowAction = { kind: "follow"; userId: number } | { kind: "remove"; relationshipId: number } | { kind: "approve" | "decline"; requestId: number };
export async function performFollowAction(action: FollowAction) {
  if (action.kind === "follow") {
    const data = await apiRequest("/api/auth/follow/", { method: "POST", body: JSON.stringify({ following: action.userId }) }, true);
    if (!isObject(data) || !isObject(data.data) || !["pending", "accepted"].includes(String(data.data.state))) throw new Error("The follow action returned an unexpected response.");
    return data.data.state === "pending" ? "Follow request sent." : "You’re now following this reader.";
  }
  if (action.kind === "remove") { await apiRequest(`/api/auth/following/${action.relationshipId}/`, { method: "DELETE" }, true); return "Follow connection removed."; }
  await apiRequest(`/api/auth/follow-requests/${action.requestId}/${action.kind === "approve" ? "accept" : "deny"}/`, { method: "POST" }, true);
  return action.kind === "approve" ? "Follow request approved." : "Follow request declined.";
}
