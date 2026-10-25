import { notFound } from "next/navigation";
import { EmptyState, PageHeading } from "@/components/ui";
const sections: Record<string, { title: string; description: string }> = {
 discover: { title: "Discover Books", description: "Find your next favourite book." },
 "my-shelf": { title: "My Shelf", description: "Your books, your journey." },
 "book-clubs": { title: "Book Clubs", description: "Read together. Think deeper. Meet new people." },
 community: { title: "Community", description: "Real people. Honest conversations. Shared love for books." },
 "pass-books-on": { title: "Pass Books On", description: "Give your books a second life." },
 messages: { title: "Messages", description: "Stay connected with your book buddies." },
 profile: { title: "Profile", description: "Your reading life, in one place." },
 settings: { title: "Settings", description: "Customise your Cradle experience." },
};
export default async function Section({ params }: { params: Promise<{ section: string }> }) {
 const { section } = await params; const page = sections[section]; if (!page) notFound();
 return <><PageHeading {...page} /><EmptyState title="This chapter is still to come">The shared design foundations are ready. This page will be built in the next implementation phases.</EmptyState></>;
}
