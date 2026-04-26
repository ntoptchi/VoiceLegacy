/**
 * Seed a demo account with sample phrases for presentation.
 *
 * Usage (from frontend/):
 *   npx tsx scripts/seed-demo.ts
 *
 * Requires MONGODB_URI in .env.local (or exported).
 */

import { MongoClient, ObjectId } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(filePath: string) {
  try {
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local may not exist; rely on exported env vars
  }
}

loadEnvFile(resolve(__dirname, "../.env.local"));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Cannot seed.");
  process.exit(1);
}

const DB_NAME = process.env.MONGODB_DB_NAME ?? "voicelegacy";

const DEMO_PHRASES: { category: string; text: string; isFavorite: boolean }[] = [
  { category: "family", text: "I love you all so much.", isFavorite: true },
  { category: "family", text: "Tell my daughter I'm proud of who she's become.", isFavorite: false },
  { category: "family", text: "You are my whole world.", isFavorite: true },
  { category: "family", text: "I'll always be here, in some way, when you need me.", isFavorite: false },
  { category: "daily", text: "Could I have some water, please?", isFavorite: false },
  { category: "daily", text: "I'm feeling a bit tired today.", isFavorite: false },
  { category: "daily", text: "Can you turn the lights down a little?", isFavorite: false },
  { category: "comfort", text: "Everything is going to be alright.", isFavorite: true },
  { category: "comfort", text: "I'm right here. You're not alone.", isFavorite: false },
  { category: "comfort", text: "Take your time. We're not in any rush.", isFavorite: false },
  { category: "humor", text: "I'm not slow — I'm just savoring the moment.", isFavorite: false },
  { category: "humor", text: "Old age and treachery beat youth and skill, every time.", isFavorite: false },
  { category: "emergency", text: "Please call someone — I think I need help.", isFavorite: false },
  { category: "emergency", text: "Please call my doctor — their number is on the fridge.", isFavorite: false },
];

async function main() {
  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  const db = client.db(DB_NAME);

  const now = new Date();
  const userId = new ObjectId();

  const user = {
    _id: userId,
    consentedAt: now,
    communicationStyle: "warm",
    audience: "My family and loved ones",
    voiceId: null,
    voiceStatus: "none",
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("users").insertOne(user);
  console.log(`Created demo user: ${userId.toHexString()}`);

  const phraseDocs = DEMO_PHRASES.map((p, i) => ({
    _id: new ObjectId(),
    userId,
    category: p.category,
    text: p.text,
    isFavorite: p.isFavorite,
    createdAt: new Date(now.getTime() - (DEMO_PHRASES.length - i) * 60_000),
  }));

  await db.collection("phrases").insertMany(phraseDocs);
  console.log(`Inserted ${phraseDocs.length} demo phrases.`);

  console.log("\n--- Demo account ready ---");
  console.log(`User ID: ${userId.toHexString()}`);
  console.log("To use: open the browser console and run:");
  console.log(`  localStorage.setItem("voicelegacy_userId", "${userId.toHexString()}")`);
  console.log(`  localStorage.setItem("voicelegacy_communicationStyle", "warm")`);
  console.log("Then navigate to /phrases or /dashboard.\n");

  await client.close();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
