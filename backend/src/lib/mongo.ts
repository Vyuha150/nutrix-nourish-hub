import { Collection, Db, MongoClient } from "mongodb";
import type { Document } from "mongodb";
import { env } from "../config/env";

let client: MongoClient | null = null;
let database: Db | null = null;

export const connectDatabase = async () => {
  if (!client) {
    client = new MongoClient(env.mongoUri);
  }

  if (!database) {
    await client.connect();
    database = client.db(env.mongoDb);
  }

  return database;
};

export const getDatabase = () => {
  if (!database) {
    throw new Error("Database has not been initialized");
  }

  return database;
};

export const getCollection = <T extends Document>(name: string) => getDatabase().collection<T>(name) as Collection<T>;