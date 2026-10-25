"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

export function LandingNavigation() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return <>
    <button ref={button} className="landing-menu-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="landing-navigation" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    <nav id="landing-navigation" aria-label="Main navigation" className={`landing-navigation ${open ? "landing-navigation-open" : ""}`} onClick={() => setOpen(false)}>
      <a href="#landing-main" aria-current="page">Home</a><a href="#books">Books</a><Link href="/book-clubs">Book Clubs</Link><a href="#community">Community</a><a href="#about">About <ChevronDown size={11} /></a>
    </nav>
  </>;
}
