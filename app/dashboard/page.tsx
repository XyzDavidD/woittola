import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Dashboard from "./Dashboard";
import { isAdminUser, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage Woittola product categories and product content.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) redirect("/dashboard/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!isAdminUser(user?.id)) redirect("/dashboard/login");

  return <Dashboard />;
}
