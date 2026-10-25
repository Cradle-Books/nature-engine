"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { pendingEmail, signIn, signUp, verifyEmail } from "@/lib/auth";
import { safeNext } from "@/components/session-provider";

function PasswordField({ id, label, confirm = false, signup = false }: { id: string; label: string; confirm?: boolean; signup?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className="auth-field"><label htmlFor={id}>{label}</label><div className="auth-input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input id={id} name={id} type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={confirm ? "One more time" : signup ? "Create a password" : "Enter your password"} required minLength={signup ? 8 : undefined} maxLength={255} /><button type="button" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>;
}

export function AuthForm({ mode }: { mode: "login" | "signup" | "verify" }) {
  const router = useRouter(); const isSignup = mode === "signup"; const isVerify = mode === "verify";
  const [pending, setPending] = useState(false); const [error, setError] = useState(""); const [email, setEmail] = useState(""); const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false); const errorRef = useRef<HTMLParagraphElement>(null); const inFlight = useRef(false);
  useEffect(() => {
    if (isVerify) setEmail(pendingEmail());
    if (mode === "login") setVerified(new URLSearchParams(window.location.search).get("verified") === "true");
  }, [isVerify, mode]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (inFlight.current) return; setError("");
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmation") ?? "");
    if (isSignup && username.includes("@")) { setError("Choose a username without the @ symbol."); errorRef.current?.focus(); return; }
    if (isSignup && password !== confirmation) { setError("Your passwords don’t match. Please check them and try again."); errorRef.current?.focus(); return; }
    inFlight.current = true; setPending(true);
    try {
      if (isVerify) { await verifyEmail(email.trim(), code); router.replace("/login?verified=true"); }
      else if (isSignup) { await signUp(username, String(data.get("email") ?? "").trim(), password, confirmation); router.push("/verify-otp"); }
      else { await signIn(username, password); router.replace(safeNext(new URLSearchParams(window.location.search).get("next"))); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again."); errorRef.current?.focus(); }
    finally { inFlight.current = false; setPending(false); }
  }

  return <>
    <div className="auth-intro"><span className="auth-eyebrow">{isVerify ? "ONE LAST LITTLE STEP" : isSignup ? "YOUR NEXT CHAPTER STARTS HERE" : "YOUR READING CORNER AWAITS"}</span><h1>{isVerify ? "Check your inbox." : isSignup ? "Make yourself at home." : "Welcome back."}</h1><p>{isVerify ? "A little code, and you’re part of the story." : isSignup ? "Good books and great company. There’s a place for you here." : "Your books, your people, your next favourite read."}</p></div>
    {!isVerify && <div className="auth-mode-switch" aria-label="Account options"><Link href="/login" aria-current={mode === "login" ? "page" : undefined}>Log in</Link><Link href="/signup" aria-current={isSignup ? "page" : undefined}>Sign up</Link></div>}
    {verified && <p className="auth-success" role="status"><Check size={17} /> Your email is verified. You can log in now.</p>}
    <form className="auth-form" onSubmit={submit} aria-busy={pending}>
      <fieldset disabled={pending}>
        {isVerify ? <>
          <div className="auth-mail-icon"><Mail size={27} strokeWidth={1.4} /></div><p className="auth-verification-copy">Enter the six-digit code sent to your email address. Your signup code is valid for 10 minutes.</p>
          <div className="auth-field"><label htmlFor="email">Email address</label><div className="auth-input-wrap"><Mail size={17} aria-hidden="true" /><input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></div></div>
          <div className="auth-field"><label htmlFor="otp">Verification code</label><input className="auth-code" id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" aria-describedby="code-help" /><p id="code-help" className="auth-field-help">Check your spam folder if it hasn’t arrived.</p></div>
        </> : <>
          <div className="auth-field"><label htmlFor="username">Username</label><div className="auth-input-wrap"><UserRound size={17} aria-hidden="true" /><input id="username" name="username" autoComplete="username" placeholder={isSignup ? "What should we call you?" : "Enter your username"} required maxLength={150} pattern=".*\S.*" /></div></div>
          {isSignup && <div className="auth-field"><label htmlFor="email">Email address</label><div className="auth-input-wrap"><Mail size={17} aria-hidden="true" /><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={254} /></div></div>}
          <PasswordField id="password" label="Password" signup={isSignup} />
          {isSignup && <><p className="auth-field-help auth-password-help">Use at least 8 characters.</p><PasswordField id="confirmation" label="Confirm password" confirm signup /></>}
        </>}
        <p ref={errorRef} className="auth-error" role="alert" tabIndex={-1}>{error}</p>
        <button className="auth-submit" type="submit">{pending ? isVerify ? "Verifying…" : isSignup ? "Creating your account…" : "Logging you in…" : isVerify ? "Verify email" : isSignup ? "Create your account" : "Log in to Cradle"}{!pending && <ArrowRight size={17} aria-hidden="true" />}</button>
      </fieldset>
    </form>
    <p className="auth-switch-copy">{isVerify ? "Wrong email or expired code? " : isSignup ? "Already found your reading corner? " : "New to our little corner? "}<Link href={isVerify ? "/signup" : isSignup ? "/login" : "/signup"}>{isVerify ? "Start signup again" : isSignup ? "Log in" : "Join Cradle"}</Link></p>
    {!isVerify && <div className="auth-guest"><span>just looking around?</span><Link href="/discover">Explore books first <ArrowRight size={14} /></Link></div>}
  </>;
}
