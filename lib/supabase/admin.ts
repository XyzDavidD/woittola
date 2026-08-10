import "server-only";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_ADMIN_USER_ID,
  );
}

export function isAdminUser(userId: string | undefined) {
  const adminUserId = process.env.SUPABASE_ADMIN_USER_ID;
  return Boolean(userId && adminUserId && userId === adminUserId);
}
