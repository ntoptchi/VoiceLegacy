import { NextResponse, type NextRequest } from "next/server";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api";
import { GeminiError, rewriteMessage } from "@/lib/gemini";
import {
  COMMUNICATION_STYLES,
  isCommunicationStyle,
  isRewriteMode,
} from "@/lib/types";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 1000;

type RewriteBody = {
  message?: unknown;
  mode?: unknown;
  communicationStyle?: unknown;
};

export async function POST(request: NextRequest) {
  const body = await readJsonBody<RewriteBody>(request);
  if (!body.ok) return body.response;

  const { message, mode, communicationStyle } = body.data ?? {};

  if (typeof message !== "string" || message.trim().length === 0) {
    return jsonError("message is required.", 400);
  }
  const trimmedMessage = message.trim();
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return jsonError(
      `message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      400,
    );
  }

  if (!isRewriteMode(mode)) {
    return jsonError(
      "mode must be one of: warmer, shorter, sound_like_me, translate.",
      400,
    );
  }

  if (!isCommunicationStyle(communicationStyle)) {
    return jsonError(
      `communicationStyle must be one of: ${COMMUNICATION_STYLES.join(", ")}.`,
      400,
    );
  }

  try {
    const { rewritten, mock } = await rewriteMessage({
      message: trimmedMessage,
      mode,
      communicationStyle,
    });
    return jsonOk({ rewritten, ...(mock ? { mock: true } : {}) });
  } catch (error) {
    if (error instanceof GeminiError) {
      console.error(
        `[api/gemini/rewrite] Gemini error (${error.status}): ${error.message}`,
      );
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    console.error("[api/gemini/rewrite] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to rewrite message.";
    return jsonError(message, 500);
  }
}
