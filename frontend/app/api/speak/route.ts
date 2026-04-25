import { NextResponse, type NextRequest } from "next/server";
import { jsonError, readJsonBody } from "@/lib/api";
import { ElevenLabsError, synthesizeSpeech } from "@/lib/elevenlabs";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 1000;

type SpeakBody = {
  text?: unknown;
  voiceId?: unknown;
};

export async function POST(request: NextRequest) {
  const body = await readJsonBody<SpeakBody>(request);
  if (!body.ok) return body.response;

  const { text, voiceId } = body.data ?? {};

  if (typeof text !== "string" || text.trim().length === 0) {
    return jsonError("text is required.", 400);
  }
  const trimmedText = text.trim();
  if (trimmedText.length > MAX_TEXT_LENGTH) {
    return jsonError(
      `text must be ${MAX_TEXT_LENGTH} characters or fewer.`,
      400,
    );
  }

  if (typeof voiceId !== "string" || voiceId.trim().length === 0) {
    return jsonError("voiceId is required.", 400);
  }

  try {
    const { audio, mock } = await synthesizeSpeech(voiceId.trim(), trimmedText);
    return new NextResponse(audio as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
        ...(mock ? { "x-voicelegacy-mock": "1" } : {}),
      },
    });
  } catch (error) {
    if (error instanceof ElevenLabsError) {
      console.error(
        `[api/speak] ElevenLabs error (${error.status}): ${error.message}`,
      );
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    console.error("[api/speak] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to synthesize speech.";
    return jsonError(message, 500);
  }
}
