import type { Metadata } from "next";
import "./globals.css";
import "./live.css";
import { AppProviders } from "@/components/session-provider";
export const metadata: Metadata = { title: "Cradle", description: "Books that connect, literally." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="en"><body><AppProviders>{children}</AppProviders></body></html>;
}
