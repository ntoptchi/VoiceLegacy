function readBoolean(name: string): boolean {
  const raw = process.env[name];
  if (!raw) return false;
  return raw.toLowerCase() === "true" || raw === "1";
}

function readString(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const env = {
  get MONGODB_URI() {
    return readString("MONGODB_URI");
  },
  get MONGODB_DB_NAME() {
    return readString("MONGODB_DB_NAME") ?? "voicelegacy";
  },
  get ELEVENLABS_API_KEY() {
    return readString("ELEVENLABS_API_KEY");
  },
  get GEMINI_API_KEY() {
    return readString("GEMINI_API_KEY");
  },
  get GEMINI_MODEL() {
    return readString("GEMINI_MODEL") ?? "gemini-2.0-flash";
  },

  get MOCK_VOICE_API() {
    return readBoolean("MOCK_VOICE_API");
  },
  get MOCK_GEMINI_API() {
    return readBoolean("MOCK_GEMINI_API");
  },
  get MOCK_DB() {
    return readBoolean("MOCK_DB");
  },
};
