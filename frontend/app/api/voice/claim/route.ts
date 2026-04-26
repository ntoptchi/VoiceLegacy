import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api";
import { findUserByClerkId, updateUserVoice } from "@/lib/db";

export const runtime = "nodejs";

type ClaimBody = {
  voiceId?: unknown;
};

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return jsonError("Unauthorized.", 401);
  }

  const body = await readJsonBody<ClaimBody>(request);
  if (!body.ok) return body.response;

  const { voiceId } = body.data ?? {};
  if (!voiceId || typeof voiceId !== "string") {
    return jsonError("voiceId is required.", 400);
  }

  try {
    const user = await findUserByClerkId(clerkUserId);
    if (!user) {
      return jsonError("User profile not found. Complete consent first.", 404);
    }

    const updated = await updateUserVoice(user._id, voiceId, "ready");
    if (!updated) {
      return jsonError("Could not update user with voice data.", 500);
    }

    return jsonOk({ claimed: true, voiceId });
  } catch (error) {
    console.error("[api/voice/claim] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to claim voice.";
    return jsonError(message, 500);
  }
}
