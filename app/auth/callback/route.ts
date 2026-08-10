import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

function safeNext(value: string | null) {
  return value === "/dashboard/reset-password" ? value : "/dashboard/login";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const destination = safeNext(requestUrl.searchParams.get("next"));

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/dashboard/login", requestUrl.origin));
  }

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createClient();

  let error: Error | null = null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && type === "recovery") {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = result.error;
  } else {
    error = new Error("Missing recovery code.");
  }

  if (error) {
    return NextResponse.redirect(new URL("/dashboard/forgot-password?error=invalid-link", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
