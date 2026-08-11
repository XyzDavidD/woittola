import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Dashboard from "./Dashboard";
import { isAdminUser, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAdminCatalogueData } from "@/lib/catalogue/queries";
import { getAdminReferenceData } from "@/lib/references/queries";
import { getAdminPartnerData } from "@/lib/partners/queries";

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

  const [catalogue, references, partners] = await Promise.all([
    getAdminCatalogueData(supabase),
    getAdminReferenceData(supabase),
    getAdminPartnerData(supabase),
  ]);

  return <Dashboard initialCategories={catalogue.categories} initialProducts={catalogue.products} initialProjects={references.projects} initialPartners={partners.partners} databaseError={catalogue.error} referenceDatabaseError={references.error} partnerDatabaseError={partners.error} />;
}
