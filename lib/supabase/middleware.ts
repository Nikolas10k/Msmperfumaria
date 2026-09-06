import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isAccountRoute = path.startsWith("/conta");

  if (!user && (isAdminRoute || isAccountRoute)) {
    const redirectUrl = new URL("/entrar", request.url);
    redirectUrl.searchParams.set("proximo", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAdminRoute) {
    const { data: staff } = await supabase
      .from("users")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (!staff || !staff.is_active || (staff.role !== "admin" && staff.role !== "staff")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}
