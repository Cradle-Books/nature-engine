import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata: Metadata = { title: "Welcome back · Cradle" };
export default function Login() {
  return <AuthForm mode="login" />;
}
