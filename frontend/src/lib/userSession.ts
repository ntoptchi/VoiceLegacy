const USER_ID_KEY = "voicelegacy_userId";
const VOICE_ID_KEY = "voicelegacy_voiceId";
const STYLE_KEY = "voicelegacy_communicationStyle";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id);
}

export function getVoiceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VOICE_ID_KEY);
}

export function setVoiceId(id: string): void {
  localStorage.setItem(VOICE_ID_KEY, id);
}

export function getCommunicationStyle(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STYLE_KEY);
}

export function setCommunicationStyle(style: string): void {
  localStorage.setItem(STYLE_KEY, style);
}

export function clearSession(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(VOICE_ID_KEY);
  localStorage.removeItem(STYLE_KEY);
}
