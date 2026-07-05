// Server-only helper to call Google's Gemini API directly.
// Previously routed through Lovable's AI gateway (ai.gateway.lovable.dev),
// which only works inside Lovable-hosted workspaces and requires Lovable
// credits. Replaced with a direct call to Google's OpenAI-compatible
// Gemini endpoint, authenticated with a standard Gemini API key.

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function callGemini(opts: {
  messages: ChatMessage[];
  model?: string;
  tools?: unknown;
  tool_choice?: unknown;
}): Promise<{
  text: string;
  toolArguments: unknown | null;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const body: Record<string, unknown> = {
    model: opts.model ?? "gemini-2.0-flash",
    messages: opts.messages,
  };
  if (opts.tools) body.tools = opts.tools;
  if (opts.tool_choice) body.tool_choice = opts.tool_choice;

  const res = await fetch(GEMINI_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limit reached. Please slow down and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted. Check your Google AI Studio billing.");
    throw new Error(`AI gateway error (${res.status}): ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const choice = data.choices?.[0];
  const message = choice?.message ?? {};
  const text: string = message.content ?? "";
  const toolCall = message.tool_calls?.[0];
  let toolArguments: unknown | null = null;
  if (toolCall?.function?.arguments) {
    try { toolArguments = JSON.parse(toolCall.function.arguments); } catch { toolArguments = null; }
  }
  return { text, toolArguments };
}
