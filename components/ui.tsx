import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Button({ variant = "primary", className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
 return <button type={type} className={cn("button", `button--${variant}`, className)} {...props} />;
}
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("card", className)} {...props} />; }
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={cn("badge", className)} {...props} />; }
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn("input", className)} {...props} />; }
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cn("input", className)} {...props} />; }
export function Avatar({ name, className }: { name: string; className?: string }) { return <span className={cn("avatar", className)} aria-label={name}>{name.split(/\s+/).slice(0, 2).map(word => word[0]).join("")}</span>; }
export function Progress({ value, label }: { value: number; label: string }) {
 const percent = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
 return <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: `${percent}%` }} /></div>;
}
export function PageHeading({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
 return <header className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>;
}
export function EmptyState({ title, children }: { title: string; children: React.ReactNode }) { return <Card className="empty-state"><h2>{title}</h2><p>{children}</p></Card>; }
