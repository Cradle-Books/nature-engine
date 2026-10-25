import type { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard/dashboard";
import "./dashboard.css";
export const metadata: Metadata = { title: "Your reading home - Cradle", description: "Great books, good people, even better conversations." };
export default function Dashboard() { return <DashboardContent />; }
