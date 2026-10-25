import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata: Metadata = { title: "Verify your email · Cradle" };
export default function VerifyOTP() { return <AuthForm mode="verify" />; }
