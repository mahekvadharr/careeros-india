// Server-only AI helper.
// gemini-2.0-flash and gemini-1.5-* were shut down June 1 2026.
// Current live models on Google AI Studio free tier:

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

// Try in order — if one is overloaded (429/503), move to the next.
// No "models/" prefix needed for the OpenAI-compat endpoint.
const MODEL_CHAIN = [
  "gemini-2.5-flash-lite-preview-06-17", // fastest, free tier
  "gemini-2.5-flash",                    // more capable fallback
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

    // Overloaded — try next model
    if (res.status === 429 || res.status === 503) continue;

    // Hard errors — don't retry
    const t = await res.text().catch(() => "");
    if (res.status === 401) throw new Error("Invalid Gemini API key. Check GEMINI_API_KEY in Vercel settings.");
    if (res.status === 402) throw new Error("AI credits exhausted. Check your Google AI Studio billing.");
    if (res.status === 404) throw new Error(`Model not found: ${model}. This is a configuration issue.`);
    throw new Error(`AI error (${res.status}): ${t.slice(0, 200)}`);
  }

  throw new Error("AI is temporarily busy. Please try again in a minute.");
}
