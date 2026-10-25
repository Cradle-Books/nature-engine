import { apiRequest, isObject } from "./http";
export type Book = { id: number; title: string; author: string; cover: string | null; genres: string[]; rating: number | null; pageCount: number | null; description: string; year: number | null };
export type LibraryEntry = { id: number; book: Book; status: "want" | "reading" | "finished" };
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
    return { id: entry.id, book: normalizeBook(entry.book_details), status: entry.status as LibraryEntry["status"] };
  });
}
async function listBooks(path: string, authenticated: boolean) {
  const data = await apiRequest(path, {}, authenticated);
  if (!isObject(data) || !Array.isArray(data.results)) throw new Error("The book list response has an unexpected format.");
  return data.results.map(normalizeBook);
}
export const fetchRecommendations = () => listBooks("/api/books/recommendations/", true);
export const fetchTrending = () => listBooks("/api/books/trending/", false);
export async function fetchBook(id: number) { return normalizeBook(await apiRequest(`/api/books/book/${id}/`)); }
export async function saveBook(id: number, status: LibraryEntry["status"] = "want") { await apiRequest("/api/books/library/", { method: "POST", body: JSON.stringify({ book: id, status }) }, true); }
export async function updateShelf(id: number, status: LibraryEntry["status"]) { await apiRequest(`/api/books/library/update/${id}/`, { method: "PATCH", body: JSON.stringify({ status }) }, true); }
