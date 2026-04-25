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

  const client = new MongoClient(uri);
  const promise = client.connect();
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
