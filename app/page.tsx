import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, BookOpenText, HandHeart, Search, Sparkles, Users } from "lucide-react";
import { Botanical } from "@/components/botanical";
import { LandingNavigation } from "@/components/landing-navigation";
import "./landing.css";
import { LandingBooks } from "@/components/landing-books";
import { LogoutNotice } from "@/components/logout-notice";

export const metadata: Metadata = {
  title: "Cradle — Books that connect, literally.",
  description: "Discover books, join communities, share your reads, and find new homes for the books you love.",
};

// Display artwork from the supplied design without baking page text into the UI.
function ReferenceArt({ x, y, width, height, label, className = "" }: { x: number; y: number; width: number; height: number; label: string; className?: string }) {
  return <span role="img" aria-label={label} className={`reference-art ${className}`} style={{ aspectRatio: `${width} / ${height}`, backgroundSize: `${514 / width * 100}% ${1024 / height * 100}%`, backgroundPosition: `${x / (514 - width) * 100}% ${y / (1024 - height) * 100}%` }} />;
}

const features = [
  { icon: BookOpenText, title: "Discover Books", text: <>Find your next<br />favourite read.</>, href: "#books" },
  { icon: Sparkles, title: "Get Recommendations", text: <>Books based on<br />your interests.</>, href: "/discover" },
  { icon: Users, title: "Join Book Clubs", text: <>Discuss, learn and<br />make new friends.</>, href: "/book-clubs" },
  { icon: HandHeart, title: "Share & Rehome", text: <>Give books a second<br />life, for a better tomorrow.</>, href: "/pass-books-on" },
];

export default function LandingPage() {
  return <div className="landing-page">
    <a className="skip-link" href="#landing-main">Skip to content</a>
    <div className="landing-site">
      <LogoutNotice />
      <header className="landing-header">
        <Link href="/" className="landing-brand" aria-label="Cradle home"><Botanical className="landing-mark" /><span>Cradle</span></Link>
        <LandingNavigation />
        <div className="landing-header-actions">
          <Link href="/discover" className="landing-search" aria-label="Search books"><Search size={17} /></Link>
          <Link href="/login" className="landing-button landing-button-outline landing-login">Log in</Link>
          <Link href="/signup" className="landing-button landing-button-cream">Join Cradle</Link>
        </div>
      </header>

      <main id="landing-main">
        <section className="landing-hero" aria-labelledby="hero-heading">
          <div className="landing-hero-copy">
            <h1 id="hero-heading">Books that connect,<br /><em>literally.</em></h1>
            <p>Discover books, join communities, share your<br className="desktop-break" /> reads, and find new homes for the books you love.</p>
            <div className="landing-actions"><Link href="/discover" className="landing-button landing-button-copper">Start Exploring <ArrowRight size={16} /></Link><a href="#about" className="landing-button landing-button-outline">Learn More</a></div>
          </div>
        </section>

        <section className="landing-features" aria-label="Find your place in Cradle">
          {features.map(({ icon: Icon, title, text, href }) => <Link href={href} className="landing-feature" key={title}><Icon size={30} strokeWidth={1.55} aria-hidden="true" /><h2>{title}</h2><p>{text}</p></Link>)}
        </section>

        <section id="community" className="landing-community" aria-labelledby="community-heading">
          <div className="landing-community-copy"><h2 id="community-heading">More than just books.</h2><p>Cradle is a space for curious minds and kindred spirits. Whether you’re here to read, connect, or simply explore, there’s a place for you.</p><Link href="/community" className="landing-button landing-button-peach">Join the community <ArrowRight size={16} /></Link></div>
          <div className="landing-polaroids">
            <Link href="/book-clubs" className="landing-polaroid"><ReferenceArt x={218} y={445} width={69} height={69} label="Readers gathered around a warm fire" /><h3>Book Clubs</h3><p>Find or start a club<br />that fits your vibe.</p></Link>
            <Link href="/community" className="landing-polaroid"><ReferenceArt x={313} y={447} width={68} height={68} label="Reading and conversation in a leafy café" /><h3>Reader Discussions</h3><p>Share thoughts,<br />get new perspectives.</p></Link>
            <Link href="/community" className="landing-polaroid"><ReferenceArt x={409} y={441} width={69} height={73} label="Books and coffee beside a sunlit window" /><h3>Events & Opportunities</h3><p>Workshops, challenges<br />and more.</p></Link>
          </div>
        </section>

        <section id="books" className="landing-books" aria-labelledby="books-heading">
          <div className="landing-section-heading"><div><h2 id="books-heading">Your next favourite is out there.</h2><p>Explore books readers are enjoying on Cradle.</p></div><Link href="/discover">View all <ArrowRight size={14} /></Link></div>
          <LandingBooks />
        </section>

        <section id="about" className="landing-bottom" aria-label="A new chapter for you and your books">
          <div className="landing-rehome"><div><h2>Pass books on</h2><p>Donate or sell books you’ve<br />outgrown and give them<br />a new home.</p><Link href="/pass-books-on" className="landing-button landing-button-earth">Learn more <ArrowRight size={14} /></Link></div><ReferenceArt x={145} y={781} width={120} height={98} label="A stack of well-loved books beside a leafy plant" /></div>
          <div id="join" className="landing-join"><Botanical className="landing-join-leaves" /><h2>Join a growing community<br />of readers.</h2><div className="landing-join-content"><div className="landing-reader-images" aria-hidden="true">{[0,1,2,3].map(index => <ReferenceArt key={index} x={294 + index * 12} y={830} width={13} height={16} label="" />)}</div><div><p>Connect with people who share<br />your love for books.</p><Link href="/signup" className="landing-button landing-button-outline">Create your account <ArrowRight size={14} /></Link></div></div></div>
        </section>
      </main>

      <footer className="landing-footer"><div className="landing-footer-brand"><Link href="/" className="landing-brand"><Botanical className="landing-mark" /><span>Cradle</span></Link><span>Books that connect, literally.</span></div><nav aria-label="Footer navigation"><a href="#landing-main">Home</a><a href="#books">Books</a><Link href="/book-clubs">Clubs</Link><a href="#community">Community</a><a href="#about">About</a></nav><a className="landing-footer-explore" href="#books" aria-label="Explore Cradle"><BookOpen size={17} /></a></footer>
    </div>
  </div>;
}
