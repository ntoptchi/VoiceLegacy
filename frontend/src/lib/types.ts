import type { ObjectId } from "mongodb";

export const PHRASE_CATEGORIES = [
  "family",
  "daily",
  "comfort",
  "humor",
  "emergency",
  "personal",
] as const;

export type PhraseCategory = (typeof PHRASE_CATEGORIES)[number];

export function isPhraseCategory(value: unknown): value is PhraseCategory {
  return (
    typeof value === "string" &&
    (PHRASE_CATEGORIES as readonly string[]).includes(value)
  );
}

export const COMMUNICATION_STYLES = [
  "warm",
  "direct",
  "humorous",
  "calm",
] as const;

export type CommunicationStyle = (typeof COMMUNICATION_STYLES)[number];

export function isCommunicationStyle(
  value: unknown,
): value is CommunicationStyle {
  return (
    typeof value === "string" &&
    (COMMUNICATION_STYLES as readonly string[]).includes(value)
  );
}

export type VoiceStatus = "none" | "recording" | "ready";

export interface UserDoc {
  _id: ObjectId;
  consentedAt: Date;
  communicationStyle: CommunicationStyle;
  audience?: string;
  voiceId: string | null;
  voiceStatus: VoiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhraseDoc {
  _id: ObjectId;
  userId: ObjectId;
  category: PhraseCategory;
  text: string;
  isFavorite: boolean;
  createdAt: Date;
}

export type RewriteMode =
  | "warmer"
  | "shorter"
  | "sound_like_me"
  | "translate";

export function isRewriteMode(value: unknown): value is RewriteMode {
  return (
    value === "warmer" ||
    value === "shorter" ||
    value === "sound_like_me" ||
    value === "translate"
  );
}
