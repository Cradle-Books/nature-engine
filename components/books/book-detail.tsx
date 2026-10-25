"use client";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, BookmarkPlus, Check, Star, Users } from "lucide-react";
import { fetchBook, fetchLibrary, fetchTrending, saveBook, updateShelf, type LibraryEntry } from "@/lib/books";
import { ApiError } from "@/lib/http";
import { useSession } from "@/components/session-provider";
import { BookCover } from "./book-cover";
import { BookActivity } from "./book-activity";

const shelfNames = { want: "Want to read", reading: "Currently reading", finished: "Finished" };
export function BookDetailContent({ id }: { id: number }) {
  const session = useSession();
  const client = useQueryClient();
  const book = useQuery({ queryKey: ["book", id], queryFn: () => fetchBook(id) });
  const library = useQuery({ queryKey: ["library", session.profile?.username], queryFn: fetchLibrary, enabled: session.status === "authenticated" });
  const popular = useQuery({ queryKey: ["trending"], queryFn: fetchTrending });
  const entry = library.data?.find(item => item.book.id === id);
  const shelf = useMutation({
    mutationFn: (status: LibraryEntry["status"]) => entry ? updateShelf(entry.id, status) : saveBook(id, status),
    onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: ["library"] }), client.invalidateQueries({ queryKey: ["recommendations"] }), client.invalidateQueries({ queryKey: ["book", id] }), session.reload()]); },
  });
  const unavailable = book.error instanceof ApiError && book.error.status === 404;
  const disabled = shelf.isPending || library.isPending || library.isError;
  return <div className="book-detail-page">
    <Link href="/discover" className="book-detail-back"><ArrowLeft size={14} /> Back to Discover</Link>
    {book.isPending ? <div className="book-detail-loading" role="status"><BookOpen size={30} /><p>Opening this book…</p></div> : book.isError ? <div className="book-detail-loading" role="alert"><h1>{unavailable ? "This book couldn’t be found" : "This chapter couldn’t load"}</h1><p>{book.error.message}</p>{!unavailable && <button type="button" className="button button--secondary" onClick={() => void book.refetch()}>Try again</button>}</div> : <div className="book-detail-layout">
      <div className="book-detail-main">
        <section className="book-detail-intro card" aria-labelledby="book-title"><div className="book-detail-cover"><BookCover book={book.data} /></div><div className="book-detail-summary"><h1 id="book-title">{book.data.title}</h1><p className="book-detail-author">by {book.data.author}</p><p className="book-detail-rating"><Star size={15} fill="currentColor" />{book.data.rating !== null ? `${book.data.rating.toFixed(1)} / 5` : "Not yet rated"}<span>Book rating</span></p><div className="book-detail-genres">{book.data.genres.map((genre, index) => <span key={`${genre}-${index}`} className="badge">{genre}</span>)}</div>
          <div className="book-detail-actions">{session.status === "loading" ? <p role="status">Checking your shelf…</p> : session.status === "authenticated" ? <><button type="button" className="button button--primary" disabled={disabled || entry?.status === "reading"} onClick={() => shelf.mutate("reading")}>{entry?.status === "reading" ? <Check size={15} /> : <BookOpen size={15} />}{entry?.status === "reading" ? "Currently reading" : "Add to Shelf"}</button><button type="button" className="button button--secondary" disabled={disabled || entry?.status === "want"} onClick={() => shelf.mutate("want")}><BookmarkPlus size={15} />Want to Read</button></> : <Link className="button button--primary" href="/login">Log in to save this book</Link>}</div>
          {entry && <label className="book-detail-shelf">On your shelf<select className="input" aria-label="Reading status" value={entry.status} disabled={disabled} onChange={event => shelf.mutate(event.target.value as LibraryEntry["status"])}>{Object.entries(shelfNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
          {shelf.isSuccess && <p className="book-detail-feedback" role="status">Your shelf has been updated.</p>}{shelf.error && <p className="auth-error" role="alert">{shelf.error.message}</p>}
          {session.status === "authenticated" && library.isError && <p role="alert" className="book-detail-feedback">Your shelf couldn’t load. <button type="button" className="book-detail-inline" onClick={() => void library.refetch()}>Try again</button></p>}
        </div></section>
        <section className="book-detail-about card" aria-labelledby="about-book"><h2 id="about-book">About this book</h2><p className="book-description">{book.data.description || "A description isn’t available for this book yet."}</p><dl className="book-detail-facts"><div><dt>Pages</dt><dd>{book.data.pageCount ?? "Unavailable"}</dd></div><div><dt>Published</dt><dd>{book.data.year ?? "Unavailable"}</dd></div></dl></section>
        <BookActivity details={book.data} />
        <section className="book-detail-bottom"><BookOpen size={24} aria-hidden="true" /><div><h2>Make room for your next chapter.</h2><p>Keep your discoveries together on your reading shelf.</p></div><Link href="/my-shelf" className="button button--secondary">My Shelf</Link></section>
      </div>
      <aside className="book-detail-related card" aria-labelledby="related-books"><h2 id="related-books">Popular on Cradle</h2><p className="book-detail-related-note">More books to explore</p>{popular.isPending ? <p role="status">Finding more books…</p> : popular.isError ? <div role="alert"><p>More books couldn’t load.</p><button type="button" className="book-detail-inline" onClick={() => void popular.refetch()}>Try again</button></div> : popular.data.filter(item => item.id !== id).slice(0, 4).map(item => <Link className="book-detail-related-book" key={item.id} href={`/books/${item.id}`}><BookCover book={item} /><div><h3>{item.title}</h3><p>{item.author}</p>{item.rating !== null && <span><Star size={10} fill="currentColor" /> {item.rating.toFixed(1)}</span>}</div></Link>)}{popular.isSuccess && popular.data.filter(item => item.id !== id).length === 0 && <p>No other books to show yet.</p>}<Link href="/discover" className="book-detail-inline"><Users size={14} /> Keep discovering</Link></aside>
    </div>}
  </div>;
}
