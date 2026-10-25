import { apiRequest, isObject } from "./http";
export type Book = { id: number; title: string; author: string; cover: string | null; genres: string[]; rating: number | null; pageCount: number | null; description: string; year: number | null };
export type LibraryEntry = { id: number; book: Book; status: "want" | "reading" | "finished"; rating?: number | null; createdAt?: string | null };
export type BookActivityEntry = { username: string; userId: number | null; status: LibraryEntry["status"]; changedAt: string | null };
export type BookDetails = Book & { readerCount: number | null; recentActivity: BookActivityEntry[] };
export type ReadingProfile = { username: string; total_books: number; reading: number; finished: number; want_to_read: number };
export function normalizeBook(data: unknown): Book {
  if (!isObject(data) || typeof data.id !== "number" || typeof data.title !== "string" || typeof data.author !== "string") throw new Error("The book response has an unexpected format.");
  return { id: data.id, title: data.title, author: data.author,
    cover: typeof data.cover === "string" && /^https?:\/\//i.test(data.cover) ? data.cover : null,
    genres: Array.isArray(data.genre) ? data.genre.filter((g): g is string => typeof g === "string") : [],
    rating: typeof data.average_rating === "number" ? data.average_rating : null,
    pageCount: typeof data.page_count === "number" ? data.page_count : null,
    description: typeof data.description === "string" ? data.description : "",
    year: typeof data.release_date === "number" ? data.release_date : null,
  };
}
export async function fetchProfile(): Promise<ReadingProfile> {
  const data = await apiRequest("/api/books/profile/", {}, true);
  if (!isObject(data) || typeof data.username !== "string" || !["total_books", "reading", "finished", "want_to_read"].every(key => typeof data[key] === "number")) throw new Error("The reading profile response has an unexpected format.");
  return data as ReadingProfile;
}
export async function fetchLibrary(): Promise<LibraryEntry[]> {
  const data = await apiRequest("/api/books/library/fetch/", {}, true);
  if (!isObject(data) || !Array.isArray(data.books)) throw new Error("The library response has an unexpected format.");
  return data.books.map(entry => {
    if (!isObject(entry) || typeof entry.id !== "number" || !["want", "reading", "finished"].includes(String(entry.status))) throw new Error("A library entry has an unexpected format.");
    return { id: entry.id, book: normalizeBook(entry.book_details), status: entry.status as LibraryEntry["status"], rating: typeof entry.ratings === "number" ? entry.ratings : null, createdAt: typeof entry.created_at === "string" && Number.isFinite(Date.parse(entry.created_at)) ? entry.created_at : null };
  });
}
async function listBooks(path: string, authenticated: boolean) {
  const data = await apiRequest(path, {}, authenticated);
  if (!isObject(data) || !Array.isArray(data.results)) throw new Error("The book list response has an unexpected format.");
  return data.results.map(normalizeBook);
}
export const fetchRecommendations = () => listBooks("/api/books/recommendations/", true);
export const fetchTrending = () => listBooks("/api/books/trending/", false);
export async function fetchBook(id: number): Promise<BookDetails> {
  const data = await apiRequest(`/api/books/book/${id}/`);
  const book = normalizeBook(data);
  const recentActivity: BookActivityEntry[] = [];
  if (isObject(data) && Array.isArray(data.recent_activity)) {
    for (const entry of data.recent_activity) {
      if (!isObject(entry) || typeof entry.user !== "string" || !entry.user.trim() || entry.user.includes("@") || !["reading", "finished", "want"].includes(String(entry.status))) continue;
      recentActivity.push({ username: entry.user.trim(), userId: typeof entry.user_id === "number" ? entry.user_id : null, status: entry.status as LibraryEntry["status"], changedAt: typeof entry.status_changed_at === "string" && Number.isFinite(Date.parse(entry.status_changed_at)) ? entry.status_changed_at : null });
    }
  }
  return { ...book, readerCount: isObject(data) && typeof data.number_of_readers === "number" && data.number_of_readers >= 0 ? data.number_of_readers : null, recentActivity };
}
export async function saveBook(id: number, status: LibraryEntry["status"] = "want") { await apiRequest("/api/books/library/", { method: "POST", body: JSON.stringify({ book: id, status }) }, true); }
export async function updateShelf(id: number, status: LibraryEntry["status"]) { await apiRequest(`/api/books/library/update/${id}/`, { method: "PATCH", body: JSON.stringify({ status }) }, true); }

export async function removeFromShelf(id: number) { await apiRequest(`/api/books/library/delete/${id}/`, { method: "DELETE" }, true); }
export async function rateBook(id: number, rating: number | null) { await apiRequest(`/api/books/library/update/${id}/`, { method: "PATCH", body: JSON.stringify({ ratings: rating }) }, true); }
