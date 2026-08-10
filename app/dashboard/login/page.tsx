import type { Metadata } from "next";
import AuthShell from "../auth/AuthShell";
import LoginForm from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Admin sign in | Woittola Healthcare",
  description: "Secure sign in for the Woittola administration dashboard.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ reset?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthShell
      eyebrow="Administrator access"
      title="Welcome back"
      description="Sign in to manage products and categories."
    >
      <LoginForm configured={isSupabaseConfigured()} passwordWasReset={params.reset === "success"} />
    </AuthShell>
  );
}
