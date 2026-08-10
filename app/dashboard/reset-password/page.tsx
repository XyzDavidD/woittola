import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "../auth/AuthShell";
import ResetPasswordForm from "./ResetPasswordForm";
import { isAdminUser, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password | Woittola Healthcare",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) redirect("/dashboard/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminUser(user?.id)) redirect("/dashboard/forgot-password");

  return (
    <AuthShell
      eyebrow="Secure recovery"
      title="Choose a new password"
      description="Create a strong, unique password for your administrator account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
