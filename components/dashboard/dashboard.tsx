"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Leaf, Star } from "lucide-react";
import { Botanical } from "@/components/botanical";
import { Card } from "@/components/ui";
import { useSession } from "@/components/session-provider";
import { BookCover } from "@/components/books/book-cover";
import { fetchLibrary, fetchRecommendations, fetchTrending, updateShelf } from "@/lib/books";
export function DashboardContent() {
  const session = useSession(); const client = useQueryClient(); const [greeting, setGreeting] = useState("Hello");
  const username = session.profile?.username || "reader";
  const library = useQuery({ queryKey: ["library", username], queryFn: fetchLibrary, enabled: session.status === "authenticated" });
  const recommendations = useQuery({ queryKey: ["recommendations", username], queryFn: fetchRecommendations, enabled: session.status === "authenticated" });
  const trending = useQuery({ queryKey: ["trending"], queryFn: fetchTrending, enabled: recommendations.isSuccess && recommendations.data.length === 0 });
  const fallback = recommendations.isSuccess && recommendations.data.length === 0;
  const books = fallback ? trending : recommendations;
  const reading = library.data?.find(entry => entry.status === "reading");
  const finish = useMutation({ mutationFn: (id: number) => updateShelf(id, "finished"), onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: ["library"] }), client.invalidateQueries({ queryKey: ["recommendations"] }), client.invalidateQueries({ queryKey: ["book"] }), session.reload()]); } });
  useEffect(() => { const hour = new Date().getHours(); setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"); }, []);
  const profile = session.profile;
  return <div className="dashboard">
    <header className="dashboard-heading"><div><h1>{greeting}, {username}</h1><p>Great books, good people, even better conversations.</p></div><Botanical className="dashboard-heading-leaves" /></header>
    <div className="dashboard-grid"><div className="dashboard-primary">
      <section className="dashboard-quote" aria-label="A little reading inspiration"><blockquote><p>“A reader lives a thousand lives<br className="dashboard-quote-break" /> before they die.”</p><cite>— George R. R. Martin</cite></blockquote></section>
      <section className="dashboard-journey" aria-labelledby="journey-title"><h2 id="journey-title">Your Reading Journey</h2><dl className="dashboard-statistics">{[{ value: profile?.finished ?? "—", label: "Books completed", href: "/my-shelf?status=finished" }, { value: profile?.reading ?? "—", label: "Currently reading", href: "/my-shelf?status=reading" }, { value: profile?.total_books ?? "—", label: "Books on your shelf", href: "/my-shelf" }, { value: "—", label: "Book clubs · Coming soon", href: "/book-clubs" }].map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd><Link href={stat.href}>{stat.value}<ArrowRight size={13} aria-hidden="true" /></Link></dd></div>)}</dl></section>
      <section className="dashboard-recommendations" aria-labelledby="recommendations-title"><div className="dashboard-section-title"><h2 id="recommendations-title">{fallback ? "Popular on Cradle" : "Recommended For You"}</h2><Link href="/discover">View all <ArrowRight size={13} /></Link></div>{fallback && <p className="dashboard-data-note">Add books to your reading shelf to help us find your next favourite.</p>}
        {books.isPending ? <div className="dashboard-book-grid" aria-label="Loading books" aria-busy="true">{Array.from({ length: 5 }, (_, index) => <div className="dashboard-book book-skeleton" key={index} />)}</div> : books.isError ? <div className="live-state" role="alert"><p>{books.error.message}</p><button className="button button--secondary" onClick={() => void books.refetch()}>Try again</button></div> : books.data?.length ? <div className="dashboard-book-grid">{books.data.slice(0, 5).map(book => <Link className="dashboard-book" key={book.id} href={`/books/${book.id}`}><BookCover book={book} /><h3 title={book.title}>{book.title}</h3><p>{book.author}</p><div className="dashboard-book-meta">{book.genres[0] && <span>{book.genres[0]}</span>}{book.rating !== null && <span className="dashboard-rating">{book.rating.toFixed(1)} <Star size={10} fill="currentColor" /></span>}</div></Link>)}</div> : <div className="live-state">More books will find their way here soon.</div>}
      </section>
    </div><aside className="dashboard-secondary" aria-label="Your reading and community">
      <Card className="dashboard-reading"><h2><Leaf size={14} fill="currentColor" aria-hidden="true" /> Currently Reading</h2>{library.isPending ? <p className="live-state" role="status">Finding your current read…</p> : library.isError ? <div className="live-state" role="alert"><p>Your reading shelf couldn’t load.</p><button className="button button--secondary" onClick={() => void library.refetch()}>Try again</button></div> : reading ? <><Link className="dashboard-current-book" href={`/books/${reading.book.id}`}><BookCover book={reading.book} /><div><h3>{reading.book.title}</h3><p>{reading.book.author}</p></div></Link><p className="dashboard-data-note">On your reading shelf</p><div className="reading-actions"><Link className="button button--primary" href={`/books/${reading.book.id}`}>Continue Reading</Link><button type="button" className="button button--secondary" disabled={finish.isPending} onClick={() => finish.mutate(reading.id)}>{finish.isPending ? "Saving…" : "Mark finished"}</button></div></> : <div className="live-state"><p>Your next chapter is waiting.</p><Link href="/discover" className="button button--primary">Find a book</Link></div>}{finish.isSuccess && <p className="dashboard-data-note" role="status">Book moved to your finished shelf.</p>}{finish.error && <p className="auth-error" role="alert">{finish.error.message}</p>}<Botanical className="dashboard-reading-leaves" /></Card>
      <Card className="dashboard-events"><div className="dashboard-section-title"><h2><CalendarDays size={14} aria-hidden="true" /> Upcoming Events</h2></div><div className="dashboard-events-coming"><CalendarDays size={29} strokeWidth={1.2} aria-hidden="true" /><h3>A little something to look forward to.</h3><p>Club meetings and community reads are coming to Cradle.</p><span className="badge">Coming soon</span></div></Card>
      <Card className="dashboard-pass"><div><h2>Pass a book on</h2><p>Give your books a second life.<br />Book sharing is coming soon.</p><span className="badge">A new chapter, soon</span></div><span className="dashboard-pass-art" aria-hidden="true" /></Card>
    </aside></div>
  </div>;
}
