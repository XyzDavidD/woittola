"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLogoutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.replace("/dashboard/login");
      router.refresh();
    }
  }

  return (
    <button className="admin-sign-out" type="button" onClick={handleSignOut} disabled={signingOut}>
      <LogOut aria-hidden="true" /> {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
