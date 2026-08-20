"use client";

import { createClient } from "@/lib/supabase/client";

export async function ensureCatalogueAdminSession() {
  const supabase = createClient();
  let userResult = await supabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      throw new Error("Your administrator session has expired. Sign out, sign in again, and then save the item.");
    }
    userResult = await supabase.auth.getUser();
  }

  if (userResult.error || !userResult.data.user) {
    throw new Error("Your administrator session has expired. Sign out, sign in again, and then save the item.");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_catalogue_admin");
  if (adminError || isAdmin !== true) {
    throw new Error("This account is not approved to manage the catalogue. Please contact the website administrator.");
  }

  return supabase;
}
