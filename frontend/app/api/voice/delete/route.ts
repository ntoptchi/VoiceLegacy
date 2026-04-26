import type { NextRequest } from "next/server";
import { jsonError, jsonOk, readJsonBody, toObjectId } from "@/lib/api";
import { findUser, clearUserVoice } from "@/lib/db";
import { deleteVoice } from "@/lib/elevenlabs";

export const runtime = "nodejs";

type DeleteVoiceBody = {
  userId?: unknown;
};

export async function POST(request: NextRequest) {
  const body = await readJsonBody<DeleteVoiceBody>(request);
  if (!body.ok) return body.response;

  const { userId } = body.data ?? {};
  if (!userId || typeof userId !== "string") {
    return jsonError("userId is required.", 400);
  }

  const idResult = toObjectId(userId);
  if (!idResult.ok) return idResult.response;

  try {
    const user = await findUser(idResult.id);
    if (!user) return jsonError("User not found.", 404);

    if (!user.voiceId) {
      return jsonError("No voice data to delete.", 400);
    }

    await deleteVoice(user.voiceId);
    await clearUserVoice(idResult.id);

    return jsonOk({ deleted: true });
  } catch (error) {
    console.error("[api/voice/delete] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete voice data.";
    return jsonError(message, 500);
  }
}
