import type { NextRequest } from "next/server";
import { jsonError, jsonOk, readJsonBody, toObjectId } from "@/lib/api";
import { deletePhrase, listPhrases } from "@/lib/db";
import {
  isPhraseCategory,
  PHRASE_CATEGORIES,
  type PhraseCategory,
} from "@/lib/types";

export const runtime = "nodejs";

// GET treats [id] as a userId and returns that user's phrases.
// (Plan calls this `/api/phrases/[userId]`, but Next.js does not allow two
// different dynamic segment names at the same level, so we collapse them.)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idResult = toObjectId(id);
  if (!idResult.ok) return idResult.response;

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

// DELETE treats [id] as the phrase id. The owning userId must be provided
// either in the JSON body or the `x-user-id` header to prevent cross-user
// deletes.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const phraseIdResult = toObjectId(id);
  if (!phraseIdResult.ok) return phraseIdResult.response;

  let userIdRaw = request.headers.get("x-user-id")?.trim() || "";
  if (!userIdRaw) {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await readJsonBody<{ userId?: unknown }>(request);
      if (!body.ok) return body.response;
      const candidate = body.data?.userId;
      if (typeof candidate === "string") userIdRaw = candidate.trim();
    }
  }

  if (!userIdRaw) {
    return jsonError(
      "userId is required (provide it in the body or the x-user-id header).",
      400,
    );
  }

  const userIdResult = toObjectId(userIdRaw);
  if (!userIdResult.ok) return userIdResult.response;

  try {
    const deleted = await deletePhrase(phraseIdResult.id, userIdResult.id);
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
