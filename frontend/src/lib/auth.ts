import { auth } from "@clerk/nextjs/server";
import { jsonError } from "./api";
import { findUserByClerkId } from "./db";
import type { UserDoc } from "./types";

type AuthResult =
  | { ok: true; clerkUserId: string; user: UserDoc }
  | { ok: false; response: Response };

export async function requireAuth(): Promise<AuthResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { ok: false, response: jsonError("Unauthorized.", 401) };
  }

  const user = await findUserByClerkId(clerkUserId);
  if (!user) {
    return {
      ok: false,
      response: jsonError("User profile not found. Complete consent first.", 404),
    };
  }

  return { ok: true, clerkUserId, user };
}
