import type { Metadata } from "next";
import { DiscoverContent } from "@/components/books/discover";
import "./discover.css";

export const metadata: Metadata = { title: "Discover Books - Cradle", description: "Find new reads, timeless classics, and hidden gems on Cradle." };
export default async function Discover({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  return <DiscoverContent key={query} initialQuery={query} />;
}
