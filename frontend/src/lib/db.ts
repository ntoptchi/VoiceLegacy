import { ObjectId, type Collection } from "mongodb";
import { getDb } from "./mongodb";
import { env } from "./env";
import type {
  CommunicationStyle,
  PhraseCategory,
  PhraseDoc,
  UserDoc,
  VoiceStatus,
} from "./types";

const USERS = "users";
const PHRASES = "phrases";

async function usersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  return db.collection<UserDoc>(USERS);
}

async function phrasesCollection(): Promise<Collection<PhraseDoc>> {
  const db = await getDb();
  return db.collection<PhraseDoc>(PHRASES);
}

type MockStore = {
  users: Map<string, UserDoc>;
  phrases: Map<string, PhraseDoc>;
};

type GlobalWithMockStore = typeof globalThis & {
  __voicelegacyMockStore?: MockStore;
};

function getMockStore(): MockStore {
  const g = globalThis as GlobalWithMockStore;
  if (!g.__voicelegacyMockStore) {
    g.__voicelegacyMockStore = {
      users: new Map(),
      phrases: new Map(),
    };
  }
  return g.__voicelegacyMockStore;
}

function shouldUseMockDb(): boolean {
  return env.MOCK_DB || !env.MONGODB_URI;
}

export async function createUser(input: {
  communicationStyle: CommunicationStyle;
  audience?: string;
}): Promise<UserDoc> {
  const now = new Date();
  const doc: UserDoc = {
    _id: new ObjectId(),
    consentedAt: now,
    communicationStyle: input.communicationStyle,
    audience: input.audience,
    voiceId: null,
    voiceStatus: "none",
    createdAt: now,
    updatedAt: now,
  };

  if (shouldUseMockDb()) {
    getMockStore().users.set(doc._id.toHexString(), doc);
    return doc;
  }

  const col = await usersCollection();
  await col.insertOne(doc);
  return doc;
}

export async function findUser(id: ObjectId): Promise<UserDoc | null> {
  if (shouldUseMockDb()) {
    return getMockStore().users.get(id.toHexString()) ?? null;
  }
  const col = await usersCollection();
  return col.findOne({ _id: id });
}

export async function updateUserVoice(
  id: ObjectId,
  voiceId: string,
  status: VoiceStatus = "ready",
): Promise<UserDoc | null> {
  const updatedAt = new Date();
  if (shouldUseMockDb()) {
    const existing = getMockStore().users.get(id.toHexString());
    if (!existing) return null;
    const next: UserDoc = { ...existing, voiceId, voiceStatus: status, updatedAt };
    getMockStore().users.set(id.toHexString(), next);
    return next;
  }
  const col = await usersCollection();
  const result = await col.findOneAndUpdate(
    { _id: id },
    { $set: { voiceId, voiceStatus: status, updatedAt } },
    { returnDocument: "after" },
  );
  return result ?? null;
}

export async function setVoiceStatus(
  id: ObjectId,
  status: VoiceStatus,
): Promise<UserDoc | null> {
  const updatedAt = new Date();
  if (shouldUseMockDb()) {
    const existing = getMockStore().users.get(id.toHexString());
    if (!existing) return null;
    const next: UserDoc = { ...existing, voiceStatus: status, updatedAt };
    getMockStore().users.set(id.toHexString(), next);
    return next;
  }
  const col = await usersCollection();
  const result = await col.findOneAndUpdate(
    { _id: id },
    { $set: { voiceStatus: status, updatedAt } },
    { returnDocument: "after" },
  );
  return result ?? null;
}

export async function listPhrases(
  userId: ObjectId,
  category?: PhraseCategory,
): Promise<PhraseDoc[]> {
  if (shouldUseMockDb()) {
    const all = Array.from(getMockStore().phrases.values()).filter((p) =>
      p.userId.equals(userId),
    );
    const filtered = category ? all.filter((p) => p.category === category) : all;
    return filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
  const col = await phrasesCollection();
  const filter: Record<string, unknown> = { userId };
  if (category) filter.category = category;
  return col.find(filter).sort({ createdAt: -1 }).toArray();
}

export async function createPhrase(input: {
  userId: ObjectId;
  category: PhraseCategory;
  text: string;
  isFavorite?: boolean;
}): Promise<PhraseDoc> {
  const doc: PhraseDoc = {
    _id: new ObjectId(),
    userId: input.userId,
    category: input.category,
    text: input.text,
    isFavorite: Boolean(input.isFavorite),
    createdAt: new Date(),
  };
  if (shouldUseMockDb()) {
    getMockStore().phrases.set(doc._id.toHexString(), doc);
    return doc;
  }
  const col = await phrasesCollection();
  await col.insertOne(doc);
  return doc;
}

export async function clearUserVoice(id: ObjectId): Promise<UserDoc | null> {
  const updatedAt = new Date();
  if (env.MOCK_DB) {
    const existing = getMockStore().users.get(id.toHexString());
    if (!existing) return null;
    const next: UserDoc = { ...existing, voiceId: null, voiceStatus: "none", updatedAt };
    getMockStore().users.set(id.toHexString(), next);
    return next;
  }
  const col = await usersCollection();
  const result = await col.findOneAndUpdate(
    { _id: id },
    { $set: { voiceId: null, voiceStatus: "none", updatedAt } },
    { returnDocument: "after" },
  );
  return result ?? null;
}

export async function deleteUser(id: ObjectId): Promise<boolean> {
  if (env.MOCK_DB) {
    const existed = getMockStore().users.delete(id.toHexString());
    for (const [key, phrase] of getMockStore().phrases) {
      if (phrase.userId.equals(id)) getMockStore().phrases.delete(key);
    }
    return existed;
  }
  const phraseCol = await phrasesCollection();
  await phraseCol.deleteMany({ userId: id });
  const userCol = await usersCollection();
  const result = await userCol.deleteOne({ _id: id });
  return result.deletedCount === 1;
}

export async function updatePhraseFavorite(
  phraseId: ObjectId,
  userId: ObjectId,
  isFavorite: boolean,
): Promise<boolean> {
  if (env.MOCK_DB) {
    const existing = getMockStore().phrases.get(phraseId.toHexString());
    if (!existing || !existing.userId.equals(userId)) return false;
    getMockStore().phrases.set(phraseId.toHexString(), { ...existing, isFavorite });
    return true;
  }
  const col = await phrasesCollection();
  const result = await col.updateOne(
    { _id: phraseId, userId },
    { $set: { isFavorite } },
  );
  return result.matchedCount === 1;
}

export async function deletePhrase(
  phraseId: ObjectId,
  userId: ObjectId,
): Promise<boolean> {
  if (shouldUseMockDb()) {
    const existing = getMockStore().phrases.get(phraseId.toHexString());
    if (!existing || !existing.userId.equals(userId)) return false;
    getMockStore().phrases.delete(phraseId.toHexString());
    return true;
  }
  const col = await phrasesCollection();
  const result = await col.deleteOne({ _id: phraseId, userId });
  return result.deletedCount === 1;
}
