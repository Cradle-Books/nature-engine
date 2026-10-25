import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata: Metadata = { title: "Find your people · Cradle" };
export default function Signup() {
  return <AuthForm mode="signup" />;
}
