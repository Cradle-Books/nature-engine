"use client";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import type { Book } from "@/lib/books";
export function BookCover({ book }: { book: Book }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return book.cover && failedSource !== book.cover ? <img className="live-book-cover" src={book.cover} alt={`${book.title} cover`} loading="lazy" decoding="async" onError={() => setFailedSource(book.cover)} /> : <span className="live-book-cover live-book-placeholder" role="img" aria-label={`${book.title}: cover unavailable`}><BookOpen size={27} strokeWidth={1.2} /><span>{book.title}</span></span>;
}
