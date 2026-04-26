import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { jsonError, jsonOk, readJsonBody } from "@/lib/api";
import { createUser, findUserByClerkId } from "@/lib/db";
import { isCommunicationStyle } from "@/lib/types";

export const runtime = "nodejs";

type CreateUserBody = {
  consent?: unknown;
  communicationStyle?: unknown;
  audience?: unknown;
};

export async function POST(request: NextRequest) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return jsonError("Unauthorized.", 401);
  }

  const existing = await findUserByClerkId(clerkUserId);
  if (existing) {
    return jsonOk({
      userId: existing._id.toHexString(),
      voiceStatus: existing.voiceStatus,
      alreadyExists: true,
    });
  }

  const body = await readJsonBody<CreateUserBody>(request);
  if (!body.ok) return body.response;

  const { consent, communicationStyle, audience } = body.data ?? {};

  if (consent !== true) {
    return jsonError(
      "Consent must be explicitly granted (consent must be true).",
      400,
    );
  }

  if (!isCommunicationStyle(communicationStyle)) {
    return jsonError(
      "communicationStyle must be one of: warm, direct, humorous, calm.",
      400,
    );
  }

  let audienceValue: string | undefined;
  if (audience !== undefined && audience !== null) {
    if (typeof audience !== "string") {
      return jsonError("audience must be a string when provided.", 400);
    }
    const trimmed = audience.trim();
    audienceValue = trimmed.length > 0 ? trimmed : undefined;
  }

  try {
    const user = await createUser({
      clerkUserId,
      communicationStyle,
      audience: audienceValue,
    });
    return jsonOk(
      {
        userId: user._id.toHexString(),
        voiceStatus: user.voiceStatus,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[api/user/create] failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create user.";
    return jsonError(message, 500);
  }
}
