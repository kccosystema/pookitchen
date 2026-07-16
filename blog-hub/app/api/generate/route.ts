import { NextRequest, NextResponse } from "next/server";
import { generateDraft } from "@/lib/ai";

export const runtime = "nodejs";
// AI generation can take a while; allow up to 5 minutes on platforms that honor
// this (e.g. Vercel with fluid compute / longer function limits).
export const maxDuration = 300;

/**
 * POST /api/generate — generate a blog-post draft with Claude.
 * Body: { siteName, topic, guidance? }. Returns a GeneratedDraft.
 * Protected by middleware (admin session required).
 */
export async function POST(req: NextRequest) {
  const { siteName, topic, guidance } = (await req.json()) as {
    siteName?: string;
    topic?: string;
    guidance?: string;
  };

  if (!topic?.trim()) {
    return NextResponse.json({ error: "A topic is required" }, { status: 400 });
  }

  try {
    const draft = await generateDraft({
      siteName: siteName || "the site",
      topic: topic.trim(),
      guidance: guidance?.trim() || undefined,
    });
    return NextResponse.json({ draft });
  } catch (err) {
    console.error("Generation failed:", err);
    return NextResponse.json(
      { error: "Generation failed. Check server logs and ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }
}
