import type { NextRequest } from "next/server";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { createPhrase } from "@/lib/db";
import { isPhraseCategory, PHRASE_CATEGORIES } from "@/lib/types";

export const runtime = "nodejs";

const MAX_PHRASE_LENGTH = 500;

type CreatePhraseBody = {
  category?: unknown;
  text?: unknown;
  isFavorite?: unknown;
};

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const body = await readJsonBody<CreatePhraseBody>(request);
  if (!body.ok) return body.response;

  const { category, text, isFavorite } = body.data ?? {};

  if (!isPhraseCategory(category)) {
    return jsonError(
      `category must be one of: ${PHRASE_CATEGORIES.join(", ")}.`,
      400,
    );
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    return jsonError("text is required.", 400);
  }
  const trimmedText = text.trim();
  if (trimmedText.length > MAX_PHRASE_LENGTH) {
    return jsonError(
      `text must be ${MAX_PHRASE_LENGTH} characters or fewer.`,
      400,
    );
  }

  try {
    const phrase = await createPhrase({
      userId: authResult.user._id,
      category,
      text: trimmedText,
      isFavorite: Boolean(isFavorite),
    });
    return jsonOk(
      {
        phrase: {
          id: phrase._id.toHexString(),
          userId: phrase.userId.toHexString(),
          category: phrase.category,
          text: phrase.text,
          isFavorite: phrase.isFavorite,
          createdAt: phrase.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/phrases POST] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to save phrase.";
    return jsonError(message, 500);
  }
}
