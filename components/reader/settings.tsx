"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogOut, Heart, Palette, Bell } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { Botanical } from "@/components/botanical";
import { useSession } from "@/components/session-provider";
import { changePassword, fetchAccountProfile } from "@/lib/account";
import { signOut } from "@/lib/auth";
import { readAppearance, saveAppearance, type Appearance } from "@/components/appearance";

function PasswordForm() {
  const [oldPassword, setOldPassword] = useState(""); const [newPassword, setNewPassword] = useState(""); const [confirmation, setConfirmation] = useState(""); const [validation, setValidation] = useState("");
  const save = useMutation({ mutationFn: () => changePassword(oldPassword, newPassword, confirmation), onSuccess: () => { setOldPassword(""); setNewPassword(""); setConfirmation(""); } });
  function submit(event: FormEvent) { event.preventDefault(); setValidation(""); if (newPassword !== confirmation) { setValidation("New passwords must match."); return; } save.mutate(); }
  return <section className="reader-panel card" id="password"><h2><LockKeyhole size={18} /> Change password</h2><form className="reader-form" onSubmit={submit}><label>Current password<input className="input" type="password" autoComplete="current-password" required value={oldPassword} onChange={event => { save.reset(); setOldPassword(event.target.value); }} /></label><label>New password<input className="input" type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={event => { save.reset(); setNewPassword(event.target.value); }} /><span className="reader-note">Use at least 8 characters.</span></label><label>Confirm new password<input className="input" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={event => { save.reset(); setConfirmation(event.target.value); }} /></label><button className="button button--primary" type="submit" disabled={save.isPending}>{save.isPending ? "Updating…" : "Update password"}</button>{(save.error || validation) && <p className="reader-error" role="alert">{save.error?.message || validation}</p>}{save.isSuccess && <p className="reader-feedback" role="status">Password updated.</p>}</form></section>;
}
export function SettingsContent() {
  const session = useSession(); const router = useRouter();
  const [appearance, setAppearance] = useState<Appearance>({ theme: "light", size: "medium" }); const [appearanceNotice, setAppearanceNotice] = useState(""); const [appearanceError, setAppearanceError] = useState("");
  const account = useQuery({ queryKey: ["account-profile", session.profile?.username], queryFn: fetchAccountProfile, enabled: session.status === "authenticated" });
  const logout = useMutation({ mutationFn: signOut, onSuccess: () => router.replace("/"), onError: () => router.replace("/?logout=local") });
  useEffect(() => { const sync = () => setAppearance(readAppearance()); sync(); window.addEventListener("storage", sync); return () => window.removeEventListener("storage", sync); }, []);
  function update(value: Appearance) { setAppearanceError(""); try { saveAppearance(value); setAppearance(value); setAppearanceNotice("Appearance saved in this browser."); } catch { setAppearanceError("Your browser couldn’t save this preference."); } }
  return <div className="reader-page"><PageHeading title="Settings" description="Customise your Cradle experience." /><div className="settings-layout"><div className="settings-sections">
    <section className="reader-panel card"><h2><Palette size={18} /> Appearance</h2><p className="reader-note">These preferences stay in this browser.</p><div className="reader-form"><fieldset className="settings-segments"><legend>Theme</legend>{(["light", "dark", "system"] as const).map(value => <label key={value}><input type="radio" name="theme" checked={appearance.theme === value} onChange={() => update({ ...appearance, theme: value })} /><span>{value}</span></label>)}</fieldset><fieldset className="settings-segments"><legend>Reading text size</legend>{(["small", "medium", "large"] as const).map(value => <label key={value}><input type="radio" name="reading-size" checked={appearance.size === value} onChange={() => update({ ...appearance, size: value })} /><span>{value}</span></label>)}</fieldset><p className="reader-note">Adjusts book descriptions for comfortable reading.</p><p className="book-description settings-text-preview">There’s always room for one more chapter.</p>{appearanceNotice && <p className="reader-feedback" role="status">{appearanceNotice}</p>}{appearanceError && <p role="alert" className="reader-error">{appearanceError}</p>}</div></section>
    <section className="reader-panel card" id="notifications"><h2><Bell size={18} /> Notifications</h2><p className="reader-note">Notification preferences aren’t available yet.</p>{["Email notifications", "Push notifications", "Community updates", "Book club reminders"].map(label => <label className="settings-unavailable" key={label}><span>{label}</span><input type="checkbox" role="switch" disabled aria-label={`${label}: not available yet`} /></label>)}</section>
    <section className="reader-panel card" id="privacy"><h2><LockKeyhole size={18} /> Privacy & security</h2><p className="reader-note">{account.isSuccess ? `Your profile is ${account.data.privacy}.` : account.isPending ? "Loading profile visibility…" : "Profile visibility couldn’t load."}</p><p className="reader-note">Manage public/private visibility and reading interests in your profile preferences.</p><Link className="button button--secondary" href="/profile#profile-preferences">Profile preferences</Link></section>
    <PasswordForm />
    <section className="reader-panel card settings-session"><div><h2>Your session</h2><p className="reader-note">Signed in as {session.profile?.username || "Reader"}.</p></div><button type="button" className="button button--secondary" disabled={logout.isPending} onClick={() => logout.mutate()}><LogOut size={15} /> {logout.isPending ? "Logging out…" : "Log out"}</button></section>
  </div><aside className="settings-quote card"><Botanical className="settings-quote-leaves" /><Heart size={20} fill="currentColor" /><blockquote>Books<br />help us find<br />our people.</blockquote><span>A little space to grow.</span></aside></div></div>;
}
