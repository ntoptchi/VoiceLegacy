import { env } from "./env";

const VOICE_ADD_URL = "https://api.elevenlabs.io/v1/voices/add";
const TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

const MOCK_UPLOAD_DELAY_MS = 2000;

type ElevenLabsErrorPayload = {
  detail?:
    | string
    | {
        status?: string;
        message?: string;
      };
  message?: string;
};

function extractErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const data = payload as ElevenLabsErrorPayload;
    if (typeof data.detail === "string" && data.detail.trim().length > 0) {
      return data.detail;
    }
    if (data.detail && typeof data.detail === "object") {
      const message = data.detail.message?.trim();
      if (message) return message;
    }
    if (typeof data.message === "string" && data.message.trim().length > 0) {
      return data.message;
    }
  }
  return `ElevenLabs request failed with status ${status}.`;
}

export class ElevenLabsError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "ElevenLabsError";
    this.status = status;
  }
}

function getApiKey(): string {
  const key = env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new ElevenLabsError(
      "ELEVENLABS_API_KEY is not configured on the server.",
      500,
    );
  }
  return key;
}

export async function cloneVoiceFromFiles(
  files: File[],
  name: string,
): Promise<{ voiceId: string; mock: boolean }> {
  if (env.MOCK_VOICE_API) {
    console.log(
      `[elevenlabs] MOCK_VOICE_API enabled — returning stub voice_id after ${MOCK_UPLOAD_DELAY_MS}ms (received ${files.length} file(s)).`,
    );
    await new Promise((r) => setTimeout(r, MOCK_UPLOAD_DELAY_MS));
    return { voiceId: "mock_voice_123", mock: true };
  }

  const apiKey = getApiKey();
  const form = new FormData();
  form.append("name", name);
  for (const file of files) {
    form.append("files", file, file.name);
  }

  const response = await fetch(VOICE_ADD_URL, {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(parsed, response.status);
    throw new ElevenLabsError(message, 502);
  }

  const voiceId =
    parsed && typeof parsed === "object"
      ? (parsed as { voice_id?: string }).voice_id
      : undefined;

  if (!voiceId || typeof voiceId !== "string") {
    throw new ElevenLabsError(
      "ElevenLabs response did not include a voice_id.",
      502,
    );
  }

  return { voiceId, mock: false };
}

export async function deleteVoice(
  voiceId: string,
): Promise<{ deleted: boolean; mock: boolean }> {
  if (env.MOCK_VOICE_API) {
    console.log(
      `[elevenlabs] MOCK_VOICE_API enabled — stub delete for voice=${voiceId}`,
    );
    return { deleted: true, mock: true };
  }

  const apiKey = getApiKey();
  const url = `https://api.elevenlabs.io/v1/voices/${encodeURIComponent(voiceId)}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { "xi-api-key": apiKey },
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    const message = extractErrorMessage(parsed, response.status);
    throw new ElevenLabsError(message, 502);
  }

  return { deleted: true, mock: false };
}

// 1-second silent MP3 (used as the mock TTS payload).
const SILENT_MP3_BASE64 =
  "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYxLjcuMTAwAAAAAAAAAAAAAAD/+0DAAAAAAAAAAAAAAAAAAAAAAABJbmZvAAAADwAAAAIAAAGwAICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID//////////////////////////////////////////////////////////////////8AAAAATGF2YzYxLjE5AAAAAAAAAAAAAAAAJAAAAAAAAAAAAbA7l7g/AAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+xDEKQPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+xDEUgPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+xDEewPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+xDEpAPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+xDEzQPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

function decodeBase64ToUint8(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64, "base64");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function synthesizeSpeech(
  voiceId: string,
  text: string,
): Promise<{ audio: Uint8Array; mock: boolean }> {
  if (env.MOCK_VOICE_API) {
    console.log(
      `[elevenlabs] MOCK_VOICE_API enabled — returning silent MP3 for voice=${voiceId} text="${text.slice(0, 40)}..."`,
    );
    return { audio: decodeBase64ToUint8(SILENT_MP3_BASE64), mock: true };
  }

  const apiKey = getApiKey();
  const url = `${TTS_URL}/${encodeURIComponent(voiceId)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    const message = extractErrorMessage(parsed, response.status);
    throw new ElevenLabsError(message, 502);
  }

  const buffer = await response.arrayBuffer();
  return { audio: new Uint8Array(buffer), mock: false };
}
