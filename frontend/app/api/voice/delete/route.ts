import { jsonError, jsonOk } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { clearUserVoice } from "@/lib/db";
import { deleteVoice } from "@/lib/elevenlabs";

export const runtime = "nodejs";

export async function POST() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { user } = authResult;

  if (!user.voiceId) {
    return jsonError("No voice data to delete.", 400);
  }

  try {
    await deleteVoice(user.voiceId);
    await clearUserVoice(user._id);
    return jsonOk({ deleted: true });
  } catch (error) {
    console.error("[api/voice/delete] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete voice data.";
    return jsonError(message, 500);
  }
}
