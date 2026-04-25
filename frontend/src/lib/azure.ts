import { env } from "./env";

export class AzureError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "AzureError";
    this.status = status;
  }
}

function getCredentials(): { key: string; region: string } {
  const key = env.AZURE_SPEECH_KEY;
  const region = env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    throw new AzureError(
      "AZURE_SPEECH_KEY and AZURE_SPEECH_REGION must be configured on the server.",
      500,
    );
  }
  return { key, region };
}

type AzureRecognitionResponse = {
  RecognitionStatus?: string;
  DisplayText?: string;
  NBest?: Array<{ Display?: string; Lexical?: string }>;
};

export async function transcribeAudio(input: {
  audio: ArrayBuffer | Uint8Array;
  contentType: string;
  language?: string;
  expectedText?: string;
}): Promise<{
  transcript: string;
  matchedExpected: boolean | null;
  mock: boolean;
}> {
  if (env.MOCK_AZURE_API) {
    const transcript = input.expectedText ?? "mock transcription";
    return {
      transcript,
      matchedExpected: input.expectedText ? true : null,
      mock: true,
    };
  }

  const { key, region } = getCredentials();
  const language = input.language ?? "en-US";
  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(
    language,
  )}&format=detailed`;

  const audioBuffer: ArrayBuffer =
    input.audio instanceof Uint8Array
      ? input.audio.slice().buffer
      : input.audio;
  const body = new Blob([audioBuffer], { type: input.contentType });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": input.contentType || "audio/wav",
      Accept: "application/json",
    },
    body,
  });

  const text = await response.text();
  let parsed: AzureRecognitionResponse | null = null;
  try {
    parsed = text ? (JSON.parse(text) as AzureRecognitionResponse) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    throw new AzureError(
      `Azure speech request failed with status ${response.status}.`,
      502,
    );
  }

  const transcript =
    parsed?.DisplayText ?? parsed?.NBest?.[0]?.Display ?? "";
  const matchedExpected = input.expectedText
    ? compareSpeech(transcript, input.expectedText)
    : null;

  return { transcript, matchedExpected, mock: false };
}

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compareSpeech(actual: string, expected: string): boolean {
  const a = normalizeForCompare(actual);
  const b = normalizeForCompare(expected);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.includes(b) || b.includes(a);
}
