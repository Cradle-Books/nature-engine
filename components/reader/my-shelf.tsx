"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Search, Trash2 } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { BookCover } from "@/components/books/book-cover";
import { fetchLibrary, updateShelf, removeFromShelf, rateBook, type LibraryEntry } from "@/lib/books";
import { PageHeading } from "@/components/ui";
const statuses = { want: "Want to read", reading: "Currently reading", finished: "Finished" };
export function MyShelfContent({ initialStatus }: { initialStatus: string }) {
  const session = useSession(); const client = useQueryClient();
  const [filter, setFilter] = useState(initialStatus); const [search, setSearch] = useState(""); const [sort, setSort] = useState("recent"); const [confirm, setConfirm] = useState<number | null>(null);
  const library = useQuery({ queryKey: ["library", session.profile?.username], queryFn: fetchLibrary, enabled: session.status === "authenticated" });
  const refresh = async () => { await Promise.all([client.invalidateQueries({ queryKey: ["library"] }), client.invalidateQueries({ queryKey: ["recommendations"] }), client.invalidateQueries({ queryKey: ["book"] }), client.invalidateQueries({ queryKey: ["trending"] }), session.reload()]); };
  const update = useMutation({ mutationFn: ({ id, status }: { id: number; status: LibraryEntry["status"] }) => updateShelf(id, status), onSuccess: refresh });
  const rate = useMutation({ mutationFn: ({ id, rating }: { id: number; rating: number | null }) => rateBook(id, rating), onSuccess: refresh });
  const remove = useMutation({ mutationFn: removeFromShelf, onSuccess: async () => { setConfirm(null); await refresh(); } });
  const all = library.data ?? []; const needle = search.toLowerCase().trim();
  const visible = all.filter(entry => (filter === "all" || entry.status === filter) && (!needle || `${entry.book.title} ${entry.book.author}`.toLowerCase().includes(needle))).sort((a, b) => sort === "title" ? a.book.title.localeCompare(b.book.title) : sort === "author" ? a.book.author.localeCompare(b.book.author) : (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0));
  const error = update.error || rate.error || remove.error;
  return <div className="reader-page shelf-page"><PageHeading title="My Shelf" description="Your books, your journey." action={<Link href="/discover" className="button button--primary"><Plus size={16} /> Add Book</Link>} />
    <nav className="shelf-tabs" aria-label="Filter your shelf">{[{ value: "all", label: "All" }, ...Object.entries(statuses).map(([value, label]) => ({ value, label }))].map(item => <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label} <span>({item.value === "all" ? all.length : all.filter(entry => entry.status === item.value).length})</span></button>)}</nav>
    <div className="shelf-toolbar"><label className="shelf-search"><Search size={16} aria-hidden="true" /><input type="search" placeholder="Search your shelf…" aria-label="Search your shelf by title or author" value={search} onChange={event => setSearch(event.target.value)} /></label><label className="shelf-sort">Sort:<select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">Recently added</option><option value="title">Title A–Z</option><option value="author">Author A–Z</option></select></label></div>
    {error && <p className="reader-error" role="alert">{error.message}</p>}
    {update.isSuccess || rate.isSuccess || remove.isSuccess ? <p className="reader-feedback" role="status">Your shelf has been updated.</p> : null}
    {library.isPending ? <div className="shelf-grid" role="status" aria-label="Loading your books">{Array.from({ length: 8 }, (_, index) => <div className="shelf-skeleton" key={index} />)}</div> : library.isError ? <div className="reader-empty" role="alert"><p>{library.error.message}</p><button className="button button--secondary" onClick={() => void library.refetch()}>Try again</button></div> : visible.length === 0 ? <div className="reader-empty"><BookOpen size={35} /><h2>{all.length === 0 ? "Your next chapter starts here" : "No books match this view"}</h2><p>{all.length === 0 ? "Discover a book you love and add it to your shelf." : "Try another search or reading status."}</p><Link href="/discover" className="button button--primary">Discover Books</Link></div> : <div className="shelf-grid">{visible.map(entry => <article className="shelf-book card" key={entry.id}>
      <Link href={`/books/${entry.book.id}`} className="shelf-book-link"><BookCover book={entry.book} /><span className={`shelf-status shelf-status--${entry.status}`}>{statuses[entry.status]}</span><h2>{entry.book.title}</h2><p>{entry.book.author}</p></Link>
      <label className="shelf-field"><span className="sr-only">Reading status for {entry.book.title}</span><select aria-label={`Reading status for ${entry.book.title}`} value={entry.status} disabled={update.isPending || remove.isPending} onChange={event => update.mutate({ id: entry.id, status: event.target.value as LibraryEntry["status"] })}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="shelf-field">Your rating<select aria-label={`Your rating for ${entry.book.title}`} value={entry.rating ?? ""} disabled={rate.isPending || remove.isPending} onChange={event => rate.mutate({ id: entry.id, rating: event.target.value ? Number(event.target.value) : null })}><option value="">Not rated</option>{[1, 2, 3, 4, 5].map(value => <option value={value} key={value}>{value} / 5</option>)}</select></label>
      {entry.createdAt && <p className="shelf-date">Added {new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>}
      {confirm === entry.id ? <div className="shelf-remove-confirm"><p>Remove from your shelf?</p><button type="button" disabled={remove.isPending} onClick={() => remove.mutate(entry.id)}>Yes, remove</button><button type="button" disabled={remove.isPending} onClick={() => setConfirm(null)}>Keep book</button></div> : <button type="button" className="shelf-remove" onClick={() => setConfirm(entry.id)} aria-label={`Remove ${entry.book.title} from your shelf`}><Trash2 size={12} /> Remove</button>}
    </article>)}</div>}
  </div>;
}
