"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Library, Flame, Heart, Fingerprint, Orbit, Search, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { apiRequest, isObject } from "@/lib/http";
import { fetchTrending, normalizeBook } from "@/lib/books";
import { BookCover } from "./book-cover";

const genres = [
  { label: "Fiction", icon: BookOpen }, { label: "Non-fiction", icon: Library },
  { label: "Fantasy", icon: Flame }, { label: "Romance", icon: Heart },
  { label: "Mystery & Thriller", query: "mystery thriller", icon: Fingerprint }, { label: "Sci-fi", query: "science fiction", icon: Orbit },
];
const PAGE_SIZE = 12;
async function searchBooks(query: string, page: number) {
  const params = new URLSearchParams({ q: query, page: String(page), page_size: String(PAGE_SIZE) });
  const data = await apiRequest(`/api/books/search/?${params}`);
  if (!isObject(data) || !Array.isArray(data.results)) throw new Error("The search response has an unexpected format.");
  return data.results.map(normalizeBook);
}
export function DiscoverContent({ initialQuery }: { initialQuery: string }) {
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const books = useQuery({ queryKey: query ? ["discover-search", query, page] : ["trending"], queryFn: () => query ? searchBooks(query, page) : fetchTrending(), retry: false });
  function search(value: string) { const next = value.trim(); setInput(next); setQuery(next); setPage(1); }
  function submit(event: FormEvent) { event.preventDefault(); search(input); }
  return <div className="discover-page">
    <h1>Discover Books</h1>
    <section className="discover-hero" aria-labelledby="discover-intro">
      <div className="discover-hero-copy"><h2 id="discover-intro">Find your next<br />favourite book.</h2><p>Explore new releases, timeless classics, and<br className="discover-desktop-break" /> hidden gems — all in one place.</p></div>
      <form className="discover-search" onSubmit={submit} role="search" aria-label="Find books"><Search size={18} aria-hidden="true" /><input aria-label="Search books or authors" type="search" placeholder="Search for books, authors, genres…" value={input} onChange={event => setInput(event.target.value)} /><button type="submit">Search <ArrowRight size={14} aria-hidden="true" /></button></form>
    </section>
    <nav className="discover-genres" aria-label="Explore genres">{genres.map(({ label, query: genreQuery, icon: Icon }) => <button type="button" key={label} aria-pressed={query === (genreQuery ?? label)} onClick={() => search(genreQuery ?? label)}><span><Icon size={24} strokeWidth={1.3} aria-hidden="true" /></span>{label}</button>)}</nav>
    <section className="discover-results" aria-labelledby="discover-results-title" aria-busy={books.isFetching}>
      <header><div><h2 id="discover-results-title">{query ? `Results for “${query}”` : "Trending Now"}</h2>{query && <p>Page {page} · Search across Cradle and Open Library</p>}</div>{query && <button type="button" className="discover-text-button" onClick={() => search("")}>Back to trending <ArrowRight size={14} /></button>}</header>
      {books.isPending ? <div className="discover-grid" role="status" aria-label="Loading books">{Array.from({ length: 5 }, (_, i) => <div className="discover-skeleton" key={i} />)}</div> : books.isError ? <div className="live-state" role="alert"><p>{books.error.message}</p><button type="button" className="button button--secondary" onClick={() => void books.refetch()}>Try again</button></div> : books.data.length === 0 ? <div className="discover-empty"><BookOpen size={32} aria-hidden="true" /><h3>{query ? "No books found this time" : "Your next favourite is on its way"}</h3><p>{query ? "Try another title, author, or a broader search." : "Search for a favourite book or explore a genre above."}</p></div> : <div className="discover-grid">{books.data.map(book => <button type="button" className="discover-book" key={book.id} onClick={() => router.push(`/books/${book.id}`)} aria-label={`View ${book.title} by ${book.author}`}><BookCover book={book} /><h3>{book.title}</h3><p>{book.author}</p><div className="discover-book-meta">{book.genres[0] && <span>{book.genres[0]}</span>}{book.rating !== null && <span className="discover-rating">{book.rating.toFixed(1)} <Star size={11} fill="currentColor" aria-hidden="true" /></span>}</div></button>)}</div>}
      {query && !books.isPending && !books.isError && <nav className="discover-pagination" aria-label="Search results pages"><button type="button" className="button button--secondary" disabled={page === 1 || books.isFetching} onClick={() => setPage(value => value - 1)}><ArrowLeft size={15} /> Previous</button><span aria-live="polite">Page {page}</span><button type="button" className="button button--secondary" disabled={books.data.length < PAGE_SIZE || books.isFetching} onClick={() => setPage(value => value + 1)}>Next <ArrowRight size={15} /></button></nav>}
    </section>
  </div>;
}
