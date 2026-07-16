import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedDraft } from "./types";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

/** JSON schema the model is constrained to (structured outputs). */
const DRAFT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    slug: {
      type: "string",
      description: "URL-safe kebab-case slug derived from the title.",
    },
    excerpt: {
      type: "string",
      description: "One or two sentence summary for listings and meta description.",
    },
    content: {
      type: "string",
      description: "The full article body in Markdown. Use ## headings, lists, and short paragraphs.",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "3-6 lowercase topic tags.",
    },
    seo_title: { type: "string", description: "<= 60 characters." },
    seo_description: { type: "string", description: "<= 155 characters." },
  },
  required: ["title", "slug", "excerpt", "content", "tags", "seo_title", "seo_description"],
} as const;

export interface GenerateParams {
  /** The site the post is for (e.g. "rawr-site") — steers tone/topic. */
  siteName: string;
  /** What the user wants written about. */
  topic: string;
  /** Optional extra direction: audience, tone, keywords, length. */
  guidance?: string;
}

/**
 * Generate a blog-post draft with Claude. Returns structured fields ready to
 * drop into the editor. The human reviews and edits before publishing.
 */
export async function generateDraft(params: GenerateParams): Promise<GeneratedDraft> {
  const { siteName, topic, guidance } = params;

  const userPrompt = [
    `Write an original, well-structured blog post for the website "${siteName}".`,
    ``,
    `Topic: ${topic}`,
    guidance ? `\nAdditional direction: ${guidance}` : ``,
    ``,
    `Requirements:`,
    `- Write in clean Markdown (## subheadings, short paragraphs, lists where useful).`,
    `- Aim for roughly 700-1100 words unless the direction says otherwise.`,
    `- Be specific and useful; avoid filler and generic AI phrasing.`,
    `- Produce a kebab-case slug, a concise excerpt, topic tags, and SEO title/description.`,
  ].join("\n");

  // Streaming avoids HTTP timeouts on longer generations; we collect the final
  // message. Structured outputs guarantee the response parses to DRAFT_SCHEMA.
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: DRAFT_SCHEMA },
    },
    system:
      "You are an expert content writer and editor producing publication-ready blog posts. " +
      "You return only the requested structured fields.",
    messages: [{ role: "user", content: userPrompt }],
  });

  const message = await stream.finalMessage();

  const jsonBlock = message.content.find((b) => b.type === "text");
  if (!jsonBlock || jsonBlock.type !== "text") {
    throw new Error("Model returned no text content.");
  }

  return JSON.parse(jsonBlock.text) as GeneratedDraft;
}
