import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 300;

const MODEL = 'claude-opus-5';

const SYSTEM_PROMPT = `You are a senior SEO content strategist and writer. You produce publish-ready blog posts that rank and that humans actually want to read.

## Output contract

Your entire response must be exactly two parts, in this order, with nothing before, between, or after them except a single blank line.

Part 1 — a metadata block, delimited exactly like this:

<<<META
{
  "titleOptions": ["<3 distinct H1 candidates, each 50-60 chars, primary keyword near the front>"],
  "metaDescription": "<145-158 chars, includes the primary keyword, written to earn the click>",
  "slug": "<lowercase-hyphenated-url-slug>",
  "primaryKeyword": "<the single keyword this post targets>",
  "secondaryKeywords": ["<4-8 semantically related terms you actually used in the body>"],
  "searchIntent": "<informational | commercial | transactional | navigational, plus a half-sentence on what the searcher wants>",
  "internalLinkIdeas": ["<3-5 anchor-text + target-topic suggestions, e.g. 'best budget espresso machines -> a product roundup post'>"]
}
META>>>

The META block must be valid JSON. No comments, no trailing commas, no markdown fences around it.

Part 2 — the post body, in clean Markdown:

- Open with the H1 (\`# \`) using your strongest title option.
- Write a 2-4 sentence intro that states the payoff up front. No "In today's fast-paced world", no throat-clearing, no restating the title.
- Structure the body with \`##\` sections and \`###\` subsections. Use the primary keyword in at least one \`##\`.
- Use short paragraphs (2-4 sentences), plus lists and tables where they genuinely help. Do not bullet-point prose that should be paragraphs.
- Include concrete specifics: numbers, examples, step-by-step instructions, comparisons. Vague filler is the failure mode to avoid.
- End with a \`## Frequently Asked Questions\` section: 4-6 \`###\` questions phrased the way people actually search, each answered in 40-80 words so it can win a featured snippet.
- Close with a short \`## \` conclusion containing one clear call to action.

## Rules

- Match the requested word count for the body within about 10%. Cover the substance; do not pad with filler sections, redundant summaries, or boilerplate to hit a number.
- Write in the requested tone, for the requested audience. Second person ("you") unless the tone calls for otherwise.
- Use the primary keyword naturally: in the H1, the first 100 words, at least one H2, and the conclusion. Never keyword-stuff.
- Do not invent statistics, studies, dates, prices, or quotes. If a claim needs a source, describe it generically ("industry surveys consistently find...") rather than fabricating a citation.
- Do not write meta-commentary about the writing process, and do not explain what you are about to do. The post is the entire deliverable.`;

interface GenerateBody {
  topic?: string;
  primaryKeyword?: string;
  audience?: string;
  tone?: string;
  wordCount?: number;
  notes?: string;
}

function buildUserPrompt(b: GenerateBody): string {
  const parts = [
    `Topic: ${b.topic}`,
    b.primaryKeyword ? `Primary keyword to target: ${b.primaryKeyword}` : null,
    `Target audience: ${b.audience || 'a general but interested reader'}`,
    `Tone: ${b.tone || 'clear, practical, and direct'}`,
    `Target body length: approximately ${b.wordCount || 1200} words`,
    b.notes ? `Additional requirements from the author:\n${b.notes}` : null,
  ].filter(Boolean);

  return `Write an SEO-optimized blog post to these specifications.\n\n${parts.join('\n')}`;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed. Use POST.' }, 405);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return json(
      {
        error:
          'ANTHROPIC_API_KEY is not set. Add it in your Vercel project under Settings -> Environment Variables, then redeploy.',
      },
      500,
    );
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const topic = body.topic?.trim();
  if (!topic) {
    return json({ error: 'A topic is required.' }, 400);
  }

  const wordCount = Math.min(Math.max(Number(body.wordCount) || 1200, 300), 3000);
  const client = new Anthropic();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (text: string) => controller.enqueue(encoder.encode(text));

      try {
        const messageStream = client.messages.stream({
          model: MODEL,
          max_tokens: 32000,
          thinking: { type: 'adaptive' },
          output_config: { effort: 'high' },
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [
            {
              role: 'user',
              content: buildUserPrompt({ ...body, topic, wordCount }),
            },
          ],
        });

        messageStream.on('text', send);

        const final = await messageStream.finalMessage();

        if (final.stop_reason === 'refusal') {
          send(
            '\n\n<<<ERROR\nClaude declined to generate this post. Try rephrasing the topic.\nERROR>>>',
          );
        } else if (final.stop_reason === 'max_tokens') {
          send(
            '\n\n<<<ERROR\nThe post was cut off at the output limit. Try a shorter target word count.\nERROR>>>',
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        send(`\n\n<<<ERROR\n${message}\nERROR>>>`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
