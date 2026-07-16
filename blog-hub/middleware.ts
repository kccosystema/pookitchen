import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * Protects the admin UI and admin API. The public read API (/api/posts) and the
 * login endpoint are intentionally NOT matched, so consumer sites and the login
 * screen stay reachable without a session.
 */
export function middleware(req: NextRequest) {
  const token = process.env.ADMIN_SESSION_TOKEN;
  const authed = token && req.cookies.get(SESSION_COOKIE)?.value === token;

  if (authed) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Let the login page and auth endpoint through.
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Admin API → 401 JSON. Admin pages → redirect to login.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Guard the admin UI and the admin/generate APIs. Note /api/posts is excluded.
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/generate/:path*"],
};
