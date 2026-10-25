"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrending, type Book } from "@/lib/books";
import { BookCover } from "@/components/books/book-cover";
import { BookDialog } from "@/components/books/book-dialog";
export function LandingBooks() {
  const query = useQuery({ queryKey: ["trending"], queryFn: fetchTrending });
  const [selected, setSelected] = useState<Book | null>(null);
  if (query.isPending) return <div className="landing-book-grid" aria-label="Loading popular books" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <div key={index} className="landing-book book-skeleton" />)}</div>;
  if (query.isError) return <div className="live-state" role="alert"><p>We couldn’t load the books right now.</p><button className="button button--secondary" onClick={() => void query.refetch()}>Try again</button></div>;
  if (!query.data.length) return <p className="live-state">A new collection of books is on its way. Check back soon.</p>;
  return <><div className="landing-book-grid">{query.data.slice(0, 6).map(book => <button type="button" className="landing-book" key={book.id} onClick={() => setSelected(book)}><BookCover book={book} /><h3>{book.title}</h3><p>{book.author}</p></button>)}</div>{selected && <BookDialog key={selected.id} book={selected} onClose={() => setSelected(null)} />}</>;
}
