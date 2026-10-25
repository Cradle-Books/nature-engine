"use client";
import { useId, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, X } from "lucide-react";
import { previewEvents } from "@/lib/dashboard-preview";
import { Avatar, Button } from "@/components/ui";

export function EventPreview({ event }: { event: typeof previewEvents[number] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return <li className="dashboard-event">
    <Avatar name={event.initials} /><div><h3>{event.title}</h3><p>{event.time}</p><small>{event.club}</small></div><Button className="dashboard-event-button" variant="secondary" onClick={() => dialog.current?.showModal()} aria-label={`View sample event: ${event.title}`}>Details</Button>
    <dialog ref={dialog} aria-labelledby={titleId} className="dashboard-dialog" onClick={eventClick => { if (eventClick.target === eventClick.currentTarget) dialog.current?.close(); }}>
      <div className="dashboard-dialog-heading"><span>Sample event</span><Button variant="ghost" aria-label="Close event details" onClick={() => dialog.current?.close()}><X size={18} /></Button></div>
      <CalendarDays size={25} aria-hidden="true" /><h2 id={titleId}>{event.title}</h2><p className="dashboard-dialog-time">{event.time}</p><p>{event.description}</p><p className="dashboard-dialog-note">This event is part of the design preview. Joining and live event schedules are not available yet.</p><Link className="button button--primary" href="/book-clubs">Explore book clubs <ArrowRight size={14} /></Link>
    </dialog>
  </li>;
}
