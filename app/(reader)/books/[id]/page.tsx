import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailContent } from "@/components/books/book-detail";
import "./book-detail.css";
export const metadata: Metadata = { title: "Book details - Cradle" };
export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) notFound();
  return <BookDetailContent id={Number(id)} />;
}
