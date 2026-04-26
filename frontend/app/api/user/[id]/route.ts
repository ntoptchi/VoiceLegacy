import { jsonError, jsonOk, toObjectId } from "@/lib/api";
import { findUser, deleteUser } from "@/lib/db";

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
  const { id } = await params;
  const idResult = toObjectId(id);
  if (!idResult.ok) return idResult.response;

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
