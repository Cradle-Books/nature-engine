"use client";
import { useEffect, useId, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { X } from "lucide-react";
import { fetchBook, saveBook, updateShelf, type Book, type LibraryEntry } from "@/lib/books";
import { useSession } from "@/components/session-provider";
import { BookCover } from "./book-cover";
export function BookDialog({ book, entry, onClose }: { book: Book; entry?: LibraryEntry; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const titleId = useId(); const session = useSession(); const client = useQueryClient();
  const details = useQuery({ queryKey: ["book", book.id], queryFn: () => fetchBook(book.id) });
  const displayed = details.data ?? book;
  const refreshShelves = async () => { await Promise.all([client.invalidateQueries({ queryKey: ["library"] }), client.invalidateQueries({ queryKey: ["recommendations"] }), client.invalidateQueries({ queryKey: ["book"] }), session.reload()]); };
  const save = useMutation({ mutationFn: () => saveBook(book.id), onSuccess: refreshShelves });
  const shelf = useMutation({ mutationFn: (status: LibraryEntry["status"]) => { if (!entry) throw new Error("Save the book before changing its shelf."); return updateShelf(entry.id, status); }, onSuccess: refreshShelves });
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="dashboard-dialog book-dialog" aria-labelledby={titleId} onClose={onClose} onClick={event => { if (event.currentTarget === event.target) dialog.current?.close(); }}>
    <div className="dashboard-dialog-heading"><span>Discover a little more</span><button type="button" className="icon-button" aria-label="Close book details" onClick={() => dialog.current?.close()}><X size={18} /></button></div>
    <div className="book-dialog-intro"><BookCover book={displayed} /><div><h2 id={titleId}>{displayed.title}</h2><p>{displayed.author}</p>{displayed.rating !== null && <p>{displayed.rating.toFixed(1)} / 5 · Book rating</p>}</div></div>
    {details.isPending ? <p role="status">Loading book details…</p> : details.isError ? <div className="live-state" role="alert"><p>Book details couldn’t load.</p><button className="button button--secondary" onClick={() => void details.refetch()}>Try again</button></div> : <><dl className="book-details-meta">{displayed.pageCount !== null && <div><dt>Pages</dt><dd>{displayed.pageCount}</dd></div>}{displayed.year !== null && <div><dt>Published</dt><dd>{displayed.year}</dd></div>}{displayed.genres.length > 0 && <div><dt>Genre</dt><dd>{displayed.genres.join(", ")}</dd></div>}</dl><p className="book-description">{displayed.description || "A description isn’t available for this book yet."}</p></>}
    <p style={{ marginTop: 20 }}><Link className="button button--secondary" href={`/books/${book.id}`} onClick={onClose}>View full book details</Link></p>
    <div className="book-dialog-actions">{session.status !== "authenticated" ? <Link className="button button--primary" href="/login">Log in to save books</Link> : entry || save.isSuccess ? <><p role="status">On your {entry?.status === "reading" ? "currently reading" : entry?.status === "finished" ? "finished" : "want to read"} shelf.</p>{entry && <label className="book-shelf-control">Reading status<select className="input" aria-label="Reading status" value={entry.status} disabled={shelf.isPending} onChange={event => shelf.mutate(event.target.value as LibraryEntry["status"])}><option value="want">Want to read</option><option value="reading">Currently reading</option><option value="finished">Finished</option></select></label>}</> : <button className="button button--primary" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Want to read"}</button>}{(save.error || shelf.error) && <p role="alert">{(save.error || shelf.error)?.message}</p>}</div>
  </dialog>;
}
