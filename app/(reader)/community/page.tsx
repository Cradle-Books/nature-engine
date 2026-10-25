import type { Metadata } from "next";
import { CommunityContent } from "@/components/community/community";
import "./community.css";
export const metadata: Metadata = { title: "Community - Cradle" };
export default async function Community({ searchParams }: { searchParams: Promise<{ reader?: string }> }) {
  const params = await searchParams;
  const reader = typeof params.reader === "string" ? params.reader.trim().replace(/^@/, "") : "";
  return <CommunityContent key={reader} initialReader={reader} />;
}
