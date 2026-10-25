import type { Metadata } from "next";
import { SettingsContent } from "@/components/reader/settings";
import "@/app/reader-pages.css";
export const metadata: Metadata = { title: "Settings - Cradle" };
export default function Settings() { return <SettingsContent />; }
