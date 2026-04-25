import { NextResponse, type NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/api";
import { AzureError, transcribeAudio } from "@/lib/azure";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[api/azure/transcribe] failed to parse form data:", error);
    return jsonError("Request body must be multipart/form-data.", 400);
  }

  const audioField = formData.get("audio");
  if (!(audioField instanceof File)) {
    return jsonError("An 'audio' file field is required.", 400);
  }
  if (audioField.size === 0) {
    return jsonError("Uploaded audio file is empty.", 400);
  }

  const expectedRaw = formData.get("expectedText");
  const expectedText =
    typeof expectedRaw === "string" && expectedRaw.trim().length > 0
      ? expectedRaw.trim()
      : undefined;

  const languageRaw = formData.get("language");
  const language =
    typeof languageRaw === "string" && languageRaw.trim().length > 0
      ? languageRaw.trim()
      : undefined;

  try {
    const audioBuffer = await audioField.arrayBuffer();
    const { transcript, matchedExpected, mock } = await transcribeAudio({
      audio: audioBuffer,
      contentType: audioField.type || "audio/wav",
      expectedText,
      language,
    });

    return jsonOk({
      transcript,
      matchedExpected,
      ...(mock ? { mock: true } : {}),
    });
  } catch (error) {
    if (error instanceof AzureError) {
      console.error(
        `[api/azure/transcribe] Azure error (${error.status}): ${error.message}`,
      );
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    console.error("[api/azure/transcribe] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to transcribe audio.";
    return jsonError(message, 500);
  }
}
