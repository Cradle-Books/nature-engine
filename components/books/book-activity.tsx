"use client";
import Link from "next/link";
import { useSession } from "@/components/session-provider";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui";
import type { BookDetails } from "@/lib/books";
import "./book-activity.css";
const statusText = { reading: "Started reading", finished: "Finished this book", want: "Added to Want to Read" };
export function BookActivity({ details }: { details: BookDetails }) {
  const session = useSession();
  const readerHref = (username: string) => session.profile?.username.toLowerCase() === username.toLowerCase() ? "/profile" : `/community?reader=${encodeURIComponent(username)}`;
  return <section className="book-activity card" aria-labelledby="book-readers-title"><header><h2 id="book-readers-title">Readers & recent activity</h2>{details.readerCount !== null && <span className="badge"><Users size={13} /> {details.readerCount} {details.readerCount === 1 ? "reading shelf" : "reading shelves"}</span>}</header><p>The latest shelf updates from readers on Cradle.</p>{details.recentActivity.length ? <ul className="book-activity-list">{details.recentActivity.map(reader => <li key={reader.userId ?? reader.username}><Link href={readerHref(reader.username)} aria-label={`View ${reader.username}?s profile`}><Avatar name={reader.username} /></Link><div><Link href={readerHref(reader.username)}>{reader.username}</Link><p>{statusText[reader.status]}</p>{reader.changedAt && <time dateTime={reader.changedAt}>{new Date(reader.changedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time>}</div></li>)}</ul> : <p className="book-activity-empty">No recent reader activity to show yet.</p>}</section>;
}
