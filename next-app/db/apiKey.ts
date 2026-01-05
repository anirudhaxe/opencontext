import { eq } from "drizzle-orm";
import db from ".";
import { apiKey } from "./schema";

export const createApiKeyInDb = (
  userId: string,
  apiKeyHash: string,
  apiKeyDisplay: string,
) => {
  return db
    .insert(apiKey)
    .values({ userId, apiKeyHash, apiKeyDisplay })
    .returning({ id: apiKey.id });
};

export const deleteApiKeyFromDb = (userId: string) => {
  return db
    .delete(apiKey)
    .where(eq(apiKey.userId, userId))
    .returning({ id: apiKey.id });
};

export const lookupKeyDataByKeyHashFromDb = (apiKeyHash: string) => {
  return db
    .select()
    .from(apiKey)
    .where(eq(apiKey.apiKeyHash, apiKeyHash))
    .limit(1);
};

export const lookupKeyDataByUserIdFromDb = (userId: string) => {
  return db.select().from(apiKey).where(eq(apiKey.userId, userId)).limit(1);
};
