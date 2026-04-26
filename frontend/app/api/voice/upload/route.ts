import { NextResponse, type NextRequest } from "next/server";
import { jsonError, jsonOk, toObjectId } from "@/lib/api";
import { ElevenLabsError, cloneVoiceFromFiles } from "@/lib/elevenlabs";
import { updateUserVoice } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[api/voice/upload] failed to parse form data:", error);
    return jsonError("Request body must be multipart/form-data.", 400);
  }

  const userIdRaw = formData.get("userId");
  const userId =
    typeof userIdRaw === "string" && userIdRaw.trim().length > 0
      ? userIdRaw.trim()
      : null;

  const files: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key === "userId") continue;
    if (value instanceof File) files.push(value);
  }

  if (files.length === 0) {
    console.warn(
      "[api/voice/upload] received form data but no audio file was attached.",
    );
    return jsonError("No audio file was attached to the request.", 400);
  }

  console.log(
    `[api/voice/upload] cloning with ${files.length} file(s) (userId=${userId ?? "anon"}):`,
    files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
  );

  try {
    const { voiceId, mock } = await cloneVoiceFromFiles(
      files,
      `VoiceLegacy Clone - ${Date.now()}`,
    );

    if (userId) {
      const idResult = toObjectId(userId);
      if (!idResult.ok) return idResult.response;
      const updated = await updateUserVoice(idResult.id, voiceId, "ready");
      if (!updated) {
        return jsonError(
          "Voice was cloned but the user record could not be found.",
          404,
        );
      }
    }

    const payload: Record<string, unknown> = {
      voice_id: voiceId,
      voiceId,
    };
    if (mock) payload.mock = true;
    return jsonOk(payload);
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      console.error(
        `[api/voice/upload] ElevenLabs error (${error.status}): ${error.message}`,
      );
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    console.error("[api/voice/upload] unexpected error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reach the voice cloning service.";
    return jsonError(message, 500);
  }
}
