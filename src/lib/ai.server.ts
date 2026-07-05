// Server-only AI helper.
// Model names as of July 2026 — gemini-2.0-flash and gemini-1.5-* are shut down.

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

const MODEL_CHAIN = [
  "gemini-2.5-flash-lite", // fastest, most cost-efficient
  "gemini-2.5-flash",      // more capable fallback
];

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callModel(model: string, apiKey: string, body: Record<string, unknown>): Promise<Response> {
  return fetch(GEMINI_BASE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, model }),
  });
}

export async function callGemini(opts: {
  messages: ChatMessage[];
  model?: string;
  tools?: unknown;
  tool_choice?: unknown;
}): Promise<{ text: string; toolArguments: unknown | null }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured. Add it to Vercel environment variables.");

  const body: Record<string, unknown> = { messages: opts.messages };
  if (opts.tools) body.tools = opts.tools;
  if (opts.tool_choice) body.tool_choice = opts.tool_choice;

  const modelsToTry = opts.model ? [opts.model] : MODEL_CHAIN;

  for (const model of modelsToTry) {
    const res = await callModel(model, apiKey, body);

    if (res.ok) {
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

    if (res.status === 429 || res.status === 503) continue; // overloaded, try next

    const t = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("Invalid Gemini API key. Check GEMINI_API_KEY in Vercel settings.");
    if (res.status === 402) throw new Error("AI credits exhausted. Check your Google AI Studio billing.");
    throw new Error(`AI error (${res.status}): ${t.slice(0, 200)}`);
  }

  throw new Error("AI is temporarily busy. Please try again in a minute.");
}
