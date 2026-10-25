import type { Metadata } from "next";
import { MyShelfContent } from "@/components/reader/my-shelf";
import "@/app/reader-pages.css";
export const metadata: Metadata = { title: "My Shelf - Cradle" };
export default async function MyShelf({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const status = ["reading", "finished", "want"].includes(params.status ?? "") ? params.status! : "all";
  return <MyShelfContent key={status} initialStatus={status} />;
}
