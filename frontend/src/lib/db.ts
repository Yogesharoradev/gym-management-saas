import mongoose from "mongoose";
import { env } from "@/lib/env";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongoose ?? { conn: null, promise: null };
global.__mongoose = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(env.mongoUrl, {
      dbName: env.dbName,
      bufferCommands: false,
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
