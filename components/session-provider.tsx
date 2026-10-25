"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, type ReadingProfile } from "@/lib/books";
import { ApiError, SESSION_EVENT, clearSession, hasCredentials, sessionVersion } from "@/lib/http";

type Session = { status: "loading" | "guest" | "authenticated" | "error"; profile: ReadingProfile | null; error: string; reload: () => Promise<void> };
const Context = createContext<Session | null>(null);
export function useSession() { const value = useContext(Context); if (!value) throw new Error("Session provider missing"); return value; }
export function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/dashboard";
  const pathname = value.split(/[?#]/)[0];
  return ["/dashboard", "/my-shelf", "/profile", "/settings", "/messages", "/discover", "/book-clubs", "/community", "/pass-books-on"].includes(pathname) ? value : "/dashboard";
}
function SessionState({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<Session, "reload">>({ status: "loading", profile: null, error: "" });
  const pending = useRef<{ version: number; promise: Promise<void> } | null>(null);
  const logoutDestination = useRef<string | null>(null);
  const client = useQueryClient(); const pathname = usePathname(); const router = useRouter();
  const reload = useCallback(() => {
    const snapshot = sessionVersion();
    if (pending.current?.version === snapshot) return pending.current.promise;
    if (!hasCredentials()) { client.clear(); setState({ status: "guest", profile: null, error: "" }); return Promise.resolve(); }
    const promise = (async () => {
      try {
        const profile = await fetchProfile();
        if (snapshot === sessionVersion()) setState({ status: "authenticated", profile, error: "" });
      } catch (cause) {
        if (snapshot !== sessionVersion()) return;
        if (cause instanceof ApiError && cause.status === 401) { clearSession(); return; }
        setState({ status: "error", profile: null, error: cause instanceof Error ? cause.message : "Your account could not be loaded." });
      }
    })().finally(() => { if (pending.current?.version === snapshot) pending.current = null; });
    pending.current = { version: snapshot, promise }; return promise;
  }, [client]);
  useEffect(() => {
    void reload();
    const change = (event: Event) => { logoutDestination.current = event instanceof CustomEvent && typeof event.detail === "string" ? event.detail : null; client.clear(); setState({ status: "loading", profile: null, error: "" }); void reload(); };
    window.addEventListener(SESSION_EVENT, change);
    return () => window.removeEventListener(SESSION_EVENT, change);
  }, [reload, client]);
  const protectedRoute = ["/dashboard", "/my-shelf", "/profile", "/settings", "/messages"].some(path => pathname === path || pathname.startsWith(path + "/"));
  const entryRoute = ["/", "/login", "/signup", "/verify-otp"].includes(pathname);
  useEffect(() => {
    if (state.status === "guest" && protectedRoute) router.replace(logoutDestination.current || `/login?next=${encodeURIComponent(pathname + window.location.search)}`);
    if (state.status === "authenticated" && entryRoute) router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
  }, [state.status, protectedRoute, entryRoute, pathname, router]);
  const waiting = (protectedRoute && ["loading", "guest"].includes(state.status)) || (entryRoute && (state.status === "loading" || state.status === "authenticated"));
  return <Context.Provider value={{ ...state, reload }}>{waiting ? <div className="session-status" role="status">Opening your next chapter…</div> : protectedRoute && state.status === "error" ? <div className="session-status"><h1>Let’s reconnect.</h1><p role="alert">{state.error}</p><button className="button button--primary" onClick={() => void reload()}>Try again</button><button className="button button--secondary" onClick={() => clearSession("/")}>Log out on this device</button></div> : children}</Context.Provider>;
}
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30000 } } }));
  return <QueryClientProvider client={client}><SessionState>{children}</SessionState></QueryClientProvider>;
}
