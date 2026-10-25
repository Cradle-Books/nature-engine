import Link from "next/link";
import { ArrowLeft, BookOpen, Leaf } from "lucide-react";
import { Botanical } from "@/components/botanical";
import "./auth.css";
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="auth-page"><a className="skip-link" href="#auth-content">Skip to form</a><div className="auth-frame">
    <aside className="auth-story" aria-label="Welcome to Cradle">
      <Link href="/" className="auth-brand"><BookOpen size={29} strokeWidth={1.4} aria-hidden="true" /><span>Cradle</span></Link>
      <div className="auth-story-copy"><span className="auth-story-eyebrow"><Leaf size={14} aria-hidden="true" /> A LITTLE SPACE FOR YOUR READING LIFE</span><h2>Good books. <br />Kindred spirits. <br /><em>A place to belong.</em></h2><p>Discover your next favourite read, find your people,<br className="auth-desktop-break" /> and let a new chapter begin.</p><div className="auth-story-rule" /><span className="auth-motto">Books that connect, literally.</span></div>
    </aside>
    <div className="auth-form-side"><Link href="/" className="auth-back"><ArrowLeft size={14} /> Back to home</Link><main id="auth-content" className="auth-content">{children}</main><footer className="auth-footer"><Leaf size={13} aria-hidden="true" /><span>A good story starts with a little connection.</span></footer><Botanical className="auth-leaves" /></div>
  </div></div>;
}
