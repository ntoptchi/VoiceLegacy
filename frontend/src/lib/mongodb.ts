import { MongoClient, type Db } from "mongodb";
import { env } from "./env";

type GlobalWithMongo = typeof globalThis & {
  __voicelegacyMongo?: {
    client: MongoClient;
    promise: Promise<MongoClient>;
  };
};

function getCachedClient(): Promise<MongoClient> {
  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Configure it in .env.local or enable MOCK_DB.",
    );
  }

  const globalWithMongo = globalThis as GlobalWithMongo;
  if (globalWithMongo.__voicelegacyMongo) {
    return globalWithMongo.__voicelegacyMongo.promise;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
  });
  const promise = client.connect().catch((err) => {
    delete globalWithMongo.__voicelegacyMongo;
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("SSL") || msg.includes("TLS") || msg.includes("ssl")) {
      throw new Error(
        "Could not connect to MongoDB (TLS rejected). " +
          "This usually means your IP is not in the Atlas Network Access allowlist. " +
          "Go to cloud.mongodb.com → Network Access → Add Current IP Address.",
      );
    }
    throw err;
  });
  globalWithMongo.__voicelegacyMongo = { client, promise };
  return promise;
}

export async function getMongoClient(): Promise<MongoClient> {
  return getCachedClient();
}

export async function getDb(): Promise<Db> {
  const client = await getCachedClient();
  return client.db(env.MONGODB_DB_NAME);
}
