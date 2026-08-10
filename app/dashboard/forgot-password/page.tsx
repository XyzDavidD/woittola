import type { Metadata } from "next";
import AuthShell from "../auth/AuthShell";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Reset admin password | Woittola Healthcare",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset password"
      description="Enter the administrator email and we will send a secure recovery link."
    >
      <ForgotPasswordForm configured={isSupabaseConfigured()} />
    </AuthShell>
  );
}
