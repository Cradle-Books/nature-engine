"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, Home, Mail, Menu, MessageCircle, Search, ShoppingBag, Users, X } from "lucide-react";
import { Avatar } from "@/components/ui";
import { Botanical } from "@/components/botanical";
import { AccountMenu } from "@/components/account-menu";
import { useSession } from "@/components/session-provider";
const navigation = [
 { href: "/dashboard", label: "Home", icon: Home }, { href: "/discover", label: "Discover Books", icon: Search },
 { href: "/my-shelf", label: "My Shelf", icon: BookOpen }, { href: "/book-clubs", label: "Book Clubs", icon: Users },
 { href: "/community", label: "Community", icon: MessageCircle }, { href: "/pass-books-on", label: "Pass Books On", icon: ShoppingBag },
 { href: "/messages", label: "Messages", icon: Mail },
];
export function AppShell({ children }: { children: React.ReactNode }) {
 const pathname = usePathname(); const [open, setOpen] = useState(false); const menuButton = useRef<HTMLButtonElement>(null);
 const { profile } = useSession();
 useEffect(() => {
  if (!open) return;
  const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
  const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); } };
  document.addEventListener("keydown", close);
  return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", close); };
 }, [open]);
 return <div className="app-frame">
  <a className="skip-link" href="#main-content">Skip to content</a>
  {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => { setOpen(false); menuButton.current?.focus(); }} />}
  <aside id="main-navigation" className={`sidebar ${open ? "sidebar--open" : ""}`}>
   <Link className="brand" href="/" onClick={() => setOpen(false)}><BookOpen aria-hidden="true" /><span>Cradle</span></Link>
   <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => { setOpen(false); menuButton.current?.focus(); }}><X /></button>
   <nav aria-label="Main navigation">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link ${pathname === href || (href !== "/" && pathname.startsWith(href + "/")) ? "nav-link--active" : ""}`} aria-current={pathname === href || (href !== "/" && pathname.startsWith(href + "/")) ? "page" : undefined}><Icon size={19} aria-hidden="true" /><span>{label}</span></Link>)}</nav>
   <Botanical className="sidebar-botanical" />
   <AccountMenu onNavigate={() => setOpen(false)} />
  </aside>
  <div className="workspace"><header className="topbar"><button ref={menuButton} className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(true)}><Menu /></button><form className="global-search" action="/discover"><Search size={15} aria-hidden="true" /><input type="search" name="q" placeholder="Search books, authors, genres…" aria-label="Search books, authors, genres" /></form><Link className="icon-button" href="/messages?tab=notifications" aria-label="Notifications"><Bell size={19} /></Link><Link href="/profile" aria-label="Your profile"><Avatar name={profile?.username || "Reader"} /></Link></header><main id="main-content" className="main-content" tabIndex={-1}>{children}</main><footer className="app-footer">Books that connect, literally.</footer></div>
 </div>;
}
