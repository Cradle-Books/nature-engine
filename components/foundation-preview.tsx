"use client";
import { useState } from "react";
import { ArrowRight, Plus, Search } from "lucide-react";
import { Badge, Button, Card, Input, PageHeading, Progress, Select } from "@/components/ui";
import { SegmentedControl, Toggle } from "@/components/tabs";
import { Botanical } from "@/components/botanical";
export function FoundationPreview() {
 const [shelf, setShelf] = useState("all"); const [updates, setUpdates] = useState(true);
 return <><PageHeading title="A place for your reading life." description="Cradle ? Books that connect, literally." />
 <section className="foundation-banner"><Botanical className="banner-botanical" /><Badge>Earth & Moss</Badge><h2>Good books.<br />Meaningful connections.</h2><p>A quieter corner to discover, read, and belong.</p></section>
 <section className="foundation-section" aria-labelledby="palette-title"><h2 id="palette-title">Our colours</h2><div className="palette">{["moss", "ivory", "beige", "cocoa", "olive"].map(color => <Card key={color} className="swatch-card"><span className={`swatch swatch--${color}`} /><span>{color}</span></Card>)}</div></section>
 <div className="foundation-grid"><Card className="foundation-panel"><h2>The little details</h2><p className="muted">Soft surfaces, warm tones, and room to breathe.</p><div className="preview-actions"><Button><Plus size={15} /> Add Book</Button><Button variant="secondary">View all <ArrowRight size={14} /></Button><Button variant="ghost">See more</Button></div><div className="preview-actions"><Badge>Fiction</Badge><Badge className="badge--filled">Currently Reading</Badge><Badge>Want to read</Badge></div><label className="field-label" htmlFor="shelf-search">Find a book</label><div className="search-field"><Search size={16} /><Input id="shelf-search" type="search" placeholder="Search your shelf?" /></div><label className="field-label" htmlFor="sort">Sort your shelf</label><Select id="sort"><option>Recently added</option><option>Title: A?Z</option></Select></Card>
 <Card className="foundation-panel"><h2>Make yourself at home</h2><p className="muted">Controls for your reading life.</p><SegmentedControl label="Shelf preview" value={shelf} onChange={setShelf} options={[{value:"all",label:"All"},{value:"reading",label:"Currently Reading"},{value:"finished",label:"Finished"}]} /><p className="selection-status" aria-live="polite">{shelf === "all" ? "All your books" : shelf === "reading" ? "Books you?re reading" : "Books you?ve finished"}</p><Toggle checked={updates} onChange={setUpdates} label="Community updates" /><div className="progress-heading"><span>Reading progress ? preview</span><span>72%</span></div><Progress value={72} label="Example reading progress" /><p className="preview-caption">Interactive design preview. Preferences are not saved.</p></Card></div>
 </>;
}
