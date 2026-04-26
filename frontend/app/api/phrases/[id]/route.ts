import type { NextRequest } from "next/server";
import { jsonError, jsonOk, readJsonBody, toObjectId } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { deletePhrase, listPhrases, updatePhraseFavorite } from "@/lib/db";
import {
  isPhraseCategory,
  PHRASE_CATEGORIES,
  type PhraseCategory,
} from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  const idResult = toObjectId(id);
  if (!idResult.ok) return idResult.response;

  if (!authResult.user._id.equals(idResult.id)) {
    return jsonError("Forbidden.", 403);
  }

  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category");
  let category: PhraseCategory | undefined;
  if (categoryParam) {
    if (!isPhraseCategory(categoryParam)) {
      return jsonError(
        `category must be one of: ${PHRASE_CATEGORIES.join(", ")}.`,
        400,
      );
    }
    category = categoryParam;
  }

  try {
    const phrases = await listPhrases(idResult.id, category);
    return jsonOk({
      phrases: phrases.map((p) => ({
        id: p._id.toHexString(),
        userId: p.userId.toHexString(),
        category: p.category,
        text: p.text,
        isFavorite: p.isFavorite,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[api/phrases/:id GET] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load phrases.";
    return jsonError(message, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  const phraseIdResult = toObjectId(id);
  if (!phraseIdResult.ok) return phraseIdResult.response;

  const body = await readJsonBody<{ isFavorite?: unknown }>(request);
  if (!body.ok) return body.response;

  const { isFavorite } = body.data ?? {};
  if (typeof isFavorite !== "boolean") {
    return jsonError("isFavorite (boolean) is required.", 400);
  }

  try {
    const updated = await updatePhraseFavorite(
      phraseIdResult.id,
      authResult.user._id,
      isFavorite,
    );
    if (!updated) {
      return jsonError("Phrase not found or does not belong to this user.", 404);
    }
    return jsonOk({ updated: true });
  } catch (error) {
    console.error("[api/phrases/:id PATCH] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update phrase.";
    return jsonError(message, 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  const phraseIdResult = toObjectId(id);
  if (!phraseIdResult.ok) return phraseIdResult.response;

  try {
    const deleted = await deletePhrase(phraseIdResult.id, authResult.user._id);
    if (!deleted) {
      return jsonError(
        "Phrase not found or does not belong to this user.",
        404,
      );
    }
    return jsonOk({ deleted: true });
  } catch (error) {
    console.error("[api/phrases/:id DELETE] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete phrase.";
    return jsonError(message, 500);
  }
}
