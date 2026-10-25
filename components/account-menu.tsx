"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { signOut } from "@/lib/auth";
import { useSession } from "@/components/session-provider";
import { Avatar } from "@/components/ui";
export function AccountMenu({ onNavigate }: { onNavigate: () => void }) {
  const { profile, status } = useSession(); const router = useRouter(); const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    try { await signOut(); router.replace("/"); }
    catch { router.replace("/?logout=local"); }
    finally { setPending(false); onNavigate(); }
  }
  return <details className="account-menu"><summary><Avatar name={profile?.username || "Reader"} /><span className="account-label">{profile?.username || "Welcome, reader"}<small>{status === "authenticated" ? "Your reading corner" : "Explore Cradle"}</small></span><ChevronDown size={14} /></summary><div className="account-links">{status === "authenticated" ? <><Link href="/profile" onClick={onNavigate}>Profile</Link><Link href="/settings" onClick={onNavigate}>Settings</Link><button type="button" disabled={pending} onClick={() => void logout()}>{pending ? "Logging out…" : "Log out"}</button></> : <><Link href="/login" onClick={onNavigate}>Log in</Link><Link href="/signup" onClick={onNavigate}>Join Cradle</Link></>}<Link href="/foundations" onClick={onNavigate}>Design foundations</Link></div></details>;
}
