import { jsonError, jsonOk, readJsonBody, toObjectId } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { findUser, deleteUser, updateUserCommunicationStyle } from "@/lib/db";
import { isCommunicationStyle } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  const idResult = toObjectId(id);
  if (!idResult.ok) return idResult.response;

  if (!authResult.user._id.equals(idResult.id)) {
    return jsonError("Forbidden.", 403);
  }

  try {
    const user = await findUser(idResult.id);
    if (!user) {
      return jsonError("User not found.", 404);
    }
    return jsonOk({
      user: {
        id: user._id.toHexString(),
        consentedAt: user.consentedAt.toISOString(),
        communicationStyle: user.communicationStyle,
        audience: user.audience ?? null,
        voiceId: user.voiceId,
        voiceStatus: user.voiceStatus,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[api/user/:id] failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load user.";
    return jsonError(message, 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  const idResult = toObjectId(id);
  if (!idResult.ok) return idResult.response;

  if (!authResult.user._id.equals(idResult.id)) {
    return jsonError("Forbidden.", 403);
  }

  try {
    const deleted = await deleteUser(idResult.id);
    if (!deleted) {
      return jsonError("User not found.", 404);
    }
    return jsonOk({ deleted: true });
  } catch (error) {
    console.error("[api/user/:id] delete failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete user.";
    return jsonError(message, 500);
  }
}

type UpdateUserBody = {
  communicationStyle?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { id } = await params;
  const idResult = toObjectId(id);
  if (!idResult.ok) return idResult.response;

  if (!authResult.user._id.equals(idResult.id)) {
    return jsonError("Forbidden.", 403);
  }

  const body = await readJsonBody<UpdateUserBody>(request);
  if (!body.ok) return body.response;

  const { communicationStyle } = body.data ?? {};
  if (!isCommunicationStyle(communicationStyle)) {
    return jsonError(
      "communicationStyle must be one of: warm, direct, humorous.",
      400,
    );
  }

  try {
    const user = await updateUserCommunicationStyle(
      idResult.id,
      communicationStyle,
    );
    if (!user) {
      return jsonError("User not found.", 404);
    }
    return jsonOk({
      user: {
        id: user._id.toHexString(),
        communicationStyle: user.communicationStyle,
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[api/user/:id] patch failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update user.";
    return jsonError(message, 500);
  }
}
