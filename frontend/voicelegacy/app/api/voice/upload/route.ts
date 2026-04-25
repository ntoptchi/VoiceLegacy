import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

const ELEVENLABS_VOICE_ADD_URL = "https://api.elevenlabs.io/v1/voices/add";

type ElevenLabsErrorPayload = {
  detail?:
    | string
    | {
        status?: string;
        message?: string;
      };
  message?: string;
};

function extractElevenLabsError(payload: unknown, status: number): string {
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

const MOCK_UPLOAD_DELAY_MS = 2000;

export async function POST(request: NextRequest) {
  const isMockMode = process.env.MOCK_VOICE_API === "true";
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!isMockMode && !apiKey) {
    console.error(
      "[api/voice/upload] ELEVENLABS_API_KEY is not configured in the environment.",
    );
    return NextResponse.json(
      {
        success: false,
        error: "ELEVENLABS_API_KEY is not configured on the server.",
      },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[api/voice/upload] failed to parse form data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Request body must be multipart/form-data.",
      },
      { status: 400 },
    );
  }

  const files: File[] = [];
  for (const value of formData.values()) {
    if (value instanceof File) {
      files.push(value);
    }
  }

  if (files.length === 0) {
    console.warn(
      "[api/voice/upload] received form data but no audio file was attached.",
    );
    return NextResponse.json(
      {
        success: false,
        error: "No audio file was attached to the request.",
      },
      { status: 400 },
    );
  }

  if (isMockMode) {
    console.log(
      `[api/voice/upload] MOCK_VOICE_API enabled — skipping ElevenLabs and returning a stub voice_id after ${MOCK_UPLOAD_DELAY_MS}ms. Received ${files.length} file(s).`,
    );
    await new Promise((resolve) => setTimeout(resolve, MOCK_UPLOAD_DELAY_MS));
    return NextResponse.json(
      {
        success: true,
        voice_id: "mock_voice_123",
        mock: true,
      },
      { status: 200 },
    );
  }

  console.log(
    `[api/voice/upload] forwarding ${files.length} file(s) to ElevenLabs:`,
    files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
  );

  const elevenLabsForm = new FormData();
  elevenLabsForm.append("name", `VoiceLegacy Clone - ${Date.now()}`);
  for (const file of files) {
    elevenLabsForm.append("files", file, file.name);
  }

  try {
    const elevenLabsResponse = await fetch(ELEVENLABS_VOICE_ADD_URL, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey as string,
      },
      body: elevenLabsForm,
    });

    const responseText = await elevenLabsResponse.text();
    let responseData: unknown = null;
    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = null;
      }
    }

    if (!elevenLabsResponse.ok) {
      const errorMessage = extractElevenLabsError(
        responseData,
        elevenLabsResponse.status,
      );
      console.error(
        `[api/voice/upload] ElevenLabs returned ${elevenLabsResponse.status}: ${errorMessage}`,
      );
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 },
      );
    }

    const voiceId =
      responseData && typeof responseData === "object"
        ? (responseData as { voice_id?: string }).voice_id
        : undefined;

    if (!voiceId || typeof voiceId !== "string") {
      console.error(
        "[api/voice/upload] ElevenLabs response missing voice_id:",
        responseData,
      );
      return NextResponse.json(
        {
          success: false,
          error: "ElevenLabs response did not include a voice_id.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        voice_id: voiceId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "[api/voice/upload] network error contacting ElevenLabs:",
      error,
    );
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reach the voice cloning service.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
