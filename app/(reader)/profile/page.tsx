import type { Metadata } from "next";
import { ProfileContent } from "@/components/reader/profile";
import "@/app/reader-pages.css";
export const metadata: Metadata = { title: "Profile - Cradle" };
export default function Profile() { return <ProfileContent />; }
