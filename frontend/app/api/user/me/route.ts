import { jsonOk } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;

  const { user } = authResult;
  return jsonOk({
    user: {
      id: user._id.toHexString(),
      clerkUserId: user.clerkUserId,
      consentedAt: user.consentedAt.toISOString(),
      communicationStyle: user.communicationStyle,
      audience: user.audience ?? null,
      voiceId: user.voiceId,
      voiceStatus: user.voiceStatus,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  });
}
