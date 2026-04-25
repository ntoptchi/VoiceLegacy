import { jsonError, jsonOk, toObjectId } from "@/lib/api";
import { findUser } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idResult = toObjectId(id);
  if (!idResult.ok) return idResult.response;

  try {
    const user = await findUser(idResult.id);
    if (!user) return jsonError("User not found.", 404);
    return jsonOk({
      voiceStatus: user.voiceStatus,
      voiceId: user.voiceId,
    });
  } catch (error) {
    console.error("[api/voice/status/:id] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load voice status.";
    return jsonError(message, 500);
  }
}
