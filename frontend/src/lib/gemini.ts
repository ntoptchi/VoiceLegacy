import { env } from "./env";
import type {
  CommunicationStyle,
  PhraseCategory,
  RewriteMode,
} from "./types";

export class GeminiError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

function getApiKey(): string {
  const key = env.GEMINI_API_KEY;
  if (!key) {
    throw new GeminiError(
      "GEMINI_API_KEY is not configured on the server.",
      500,
    );
  }
  return key;
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

async function callGemini(prompt: string): Promise<string> {
  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    env.GEMINI_MODEL,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  const text = await response.text();
  let parsed: GeminiResponse | null = null;
  try {
    parsed = text ? (JSON.parse(text) as GeminiResponse) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const message =
      parsed?.error?.message ||
      `Gemini request failed with status ${response.status}.`;
    throw new GeminiError(message, 502);
  }

  const out = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!out || typeof out !== "string") {
    throw new GeminiError("Gemini returned no text.", 502);
  }
  return out.trim();
}

const MOCK_SUGGESTIONS: Record<PhraseCategory, string[]> = {
  family: [
    "I love you more than you know.",
    "Tell the kids I'm proud of them.",
    "Remember our Sunday breakfasts.",
    "You were the best part of my day.",
    "Give your mother my love.",
  ],
  daily: [
    "Could I have some water, please?",
    "I'd like to sit up.",
    "The light is too bright.",
    "I'm feeling cold.",
    "Thank you for helping me.",
  ],
  comfort: [
    "It's going to be alright.",
    "I'm right here with you.",
    "Take a deep breath with me.",
    "You don't have to do this alone.",
    "We've made it through worse.",
  ],
  humor: [
    "Don't make me laugh, it hurts.",
    "Tell that one joke again.",
    "Well, that's a new low.",
    "If I had a nickel...",
    "Some things never change.",
  ],
  emergency: [
    "I need help right now.",
    "Please call my doctor.",
    "Something is wrong.",
    "Get my family.",
    "Call 911.",
  ],
  personal: [
    "Hi, sweetheart.",
    "Goodnight, kiddo.",
    "Love you, bud.",
    "Hello, my dear.",
    "See you in a bit.",
  ],
};

export async function suggestPhrases(
  category: PhraseCategory,
  count: number,
): Promise<{ suggestions: string[]; mock: boolean }> {
  const safeCount = Math.max(1, Math.min(10, Math.trunc(count)));
  if (env.MOCK_GEMINI_API || !env.GEMINI_API_KEY) {
    return {
      suggestions: MOCK_SUGGESTIONS[category].slice(0, safeCount),
      mock: true,
    };
  }

  const prompt = `Suggest ${safeCount} short, meaningful phrases for the "${category}" category for someone preserving their voice for loved ones. Return only the phrases, one per line, with no numbering, bullets, or extra commentary.`;

  const raw = await callGemini(prompt);
  const suggestions = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, safeCount);

  if (suggestions.length === 0) {
    throw new GeminiError("Gemini did not return any usable suggestions.");
  }
  return { suggestions, mock: false };
}

function styleDescriptor(style: CommunicationStyle): string {
  switch (style) {
    case "warm":
      return "warm and expressive";
    case "direct":
      return "dry and direct";
    case "humorous":
      return "playful and funny";
    case "calm":
      return "calm and gentle";
  }
}

export async function rewriteMessage(input: {
  message: string;
  mode: RewriteMode;
  communicationStyle: CommunicationStyle;
}): Promise<{ rewritten: string; mock: boolean }> {
  if (env.MOCK_GEMINI_API || !env.GEMINI_API_KEY) {
    const tag =
      input.mode === "warmer"
        ? "[warmer]"
        : input.mode === "shorter"
          ? "[shorter]"
          : input.mode === "translate"
            ? "[translate]"
            : `[${input.communicationStyle}]`;
    return {
      rewritten: `${tag} ${input.message}`,
      mock: true,
    };
  }

  const styleText = styleDescriptor(input.communicationStyle);
  let instruction: string;
  switch (input.mode) {
    case "warmer":
      instruction = `Rewrite the message to feel warmer and more emotionally present, in a ${styleText} voice, while keeping the meaning.`;
      break;
    case "shorter":
      instruction = `Rewrite the message as the shortest possible version that still conveys the meaning, in a ${styleText} voice.`;
      break;
    case "sound_like_me":
      instruction = `You are rewriting a message for someone who communicates in a ${styleText} style. Rewrite this in their voice, keeping it personal and genuine.`;
      break;
    case "translate":
      instruction = `Rewrite the message as a single, natural-sounding phrase the speaker would actually say, in a ${styleText} voice.`;
      break;
  }

  const prompt = `${instruction}\n\nReturn only the rewritten message, with no quotes or commentary.\n\nOriginal: ${input.message}`;
  const raw = await callGemini(prompt);
  const rewritten = raw.replace(/^["'`\s]+|["'`\s]+$/g, "").trim();
  if (rewritten.length === 0) {
    throw new GeminiError("Gemini returned an empty rewrite.");
  }
  return { rewritten, mock: false };
}
