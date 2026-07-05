// Server-only AI helper — calls Gemini with automatic model fallback.
// Model chain: gemini-2.0-flash → gemini-1.5-flash → gemini-1.5-flash-8b
// If one model is overloaded (503) or rate-limited (429), the next is tried.

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Models tried in order. All are free-tier eligible on Google AI Studio.
const MODEL_CHAIN = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callModel(
  model: string,
  apiKey: string,
  body: Record<string, unknown>,
): Promise<Response> {
  return fetch(GEMINI_BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
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

  // Use specified model if given, otherwise try the fallback chain
  const modelsToTry = opts.model ? [opts.model] : MODEL_CHAIN;

  let lastError = "";
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

    // 429 or 503 → try next model
    if (res.status === 429 || res.status === 503) {
      lastError = `${model} busy`;
      continue;
    }

    // Any other error → fail immediately, no point retrying with another model
    const t = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("Invalid Gemini API key. Check GEMINI_API_KEY in Vercel.");
    if (res.status === 402) throw new Error("AI credits exhausted. Check your Google AI Studio billing.");
    throw new Error(`AI error (${res.status}): ${t.slice(0, 200)}`);
  }

  // All models failed
  throw new Error("AI is temporarily unavailable — all models are busy. Please try again in a minute.");
}
