import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser, isSupabaseConfigured } from "./admin";

const publicDashboardRoutes = new Set([
  "/dashboard/login",
  "/dashboard/forgot-password",
  "/dashboard/reset-password",
]);

function redirect(request: NextRequest, pathname: string, response?: NextResponse) {
  const destination = request.nextUrl.clone();
  destination.pathname = pathname;
  destination.search = "";
  const redirectResponse = NextResponse.redirect(destination);

  response?.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  redirectResponse.headers.set("Cache-Control", "private, no-store");

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isPublicDashboardRoute = publicDashboardRoutes.has(pathname);

  if (!isSupabaseConfigured()) {
    if (isDashboardRoute && !isPublicDashboardRoute) {
      const response = redirect(request, "/dashboard/login");
      response.headers.set("x-auth-setup-required", "true");
      return response;
    }

    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // getUser verifies the access token with Supabase instead of trusting cookie data.
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = isAdminUser(user?.id);

  if (isDashboardRoute && !isPublicDashboardRoute && !isAdmin) {
    const loginResponse = redirect(request, "/dashboard/login", response);
    loginResponse.headers.set("x-auth-denied", "true");
    return loginResponse;
  }

  if ((pathname === "/dashboard/login" || pathname === "/dashboard/forgot-password") && isAdmin) {
    return redirect(request, "/dashboard", response);
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
