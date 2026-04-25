import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export type ApiSuccess<T extends object = object> = { success: true } & T;
export type ApiError = { success: false; error: string };

export function jsonOk<T extends object>(
  payload: T,
  init?: ResponseInit,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, ...payload }, init);
}

export function jsonError(
  message: string,
  status = 400,
): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function readJsonBody<T = unknown>(
  request: Request,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const data = (await request.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: jsonError("Request body must be valid JSON.", 400),
    };
  }
}

export function toObjectId(
  raw: string,
):
  | { ok: true; id: ObjectId }
  | { ok: false; response: NextResponse } {
  if (!ObjectId.isValid(raw)) {
    return {
      ok: false,
      response: jsonError(`Invalid id: ${raw}`, 400),
    };
  }
  return { ok: true, id: new ObjectId(raw) };
}

export function requireString(
  value: unknown,
  field: string,
):
  | { ok: true; value: string }
  | { ok: false; response: NextResponse } {
  if (typeof value !== "string" || value.trim().length === 0) {
    return {
      ok: false,
      response: jsonError(`Missing or invalid '${field}'.`, 400),
    };
  }
  return { ok: true, value: value.trim() };
}
