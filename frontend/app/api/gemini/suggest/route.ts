import { NextResponse, type NextRequest } from "next/server";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { GeminiError, suggestPhrases } from "@/lib/gemini";
import { isPhraseCategory, PHRASE_CATEGORIES } from "@/lib/types";

export const runtime = "nodejs";

type SuggestBody = {
  category?: unknown;
  count?: unknown;
};

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const body = await readJsonBody<SuggestBody>(request);
  if (!body.ok) return body.response;

  const { category, count } = body.data ?? {};

  if (!isPhraseCategory(category)) {
    return jsonError(
      `category must be one of: ${PHRASE_CATEGORIES.join(", ")}.`,
      400,
    );
  }

  let countValue = 5;
  if (count !== undefined && count !== null) {
    if (typeof count !== "number" || !Number.isFinite(count)) {
      return jsonError("count must be a number when provided.", 400);
    }
    countValue = count;
  }

  try {
    const { suggestions, mock } = await suggestPhrases(category, countValue);
    return jsonOk({ suggestions, ...(mock ? { mock: true } : {}) });
  } catch (error) {
    if (error instanceof GeminiError) {
      console.error(
        `[api/gemini/suggest] Gemini error (${error.status}): ${error.message}`,
      );
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    console.error("[api/gemini/suggest] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate suggestions.";
    return jsonError(message, 500);
  }
}
