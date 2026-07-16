import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/** GET /api/admin/sites — list all tenant sites. */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("sites")
    .select("*")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sites: data ?? [] });
}
