import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, expectedToken } from "@/lib/auth";

export const runtime = "nodejs";

/** POST /api/auth — log in with the admin password; sets the session cookie. */
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

/** DELETE /api/auth — log out. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
