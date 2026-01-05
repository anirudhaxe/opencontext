import crypto, { randomUUID } from "crypto";
import { type webhookEventType } from "./webhook-types";

export function generateWebhookSignature(payload: webhookEventType): string {
  if (!process.env.WEBHOOK_SECRET) {
    throw new Error("WEBHOOK_SECRET environment variable is not set");
  }
  const webhookSecret = process.env.WEBHOOK_SECRET;
  return crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(payload))
    .digest("hex");
}

/**
 * Helper type to extract the payload type for a specific eventType
 */
type PayloadForEvent<T extends webhookEventType["eventType"]> = Extract<
  webhookEventType,
  { eventType: T }
>;

export function createWebhookPayload<T extends webhookEventType["eventType"]>(
  eventType: T,
  data: Extract<webhookEventType, { eventType: T }>["data"],
): PayloadForEvent<T> {
  const base = {
    provider: "opencontext-worker" as const,
    eventId: randomUUID() as string,
    timestamp: new Date().toISOString(),
  };

  // Construct the payload with correct structure
  const payload = {
    ...base,
    eventType,
    data,
  };

  // Return with proper type - cast through unknown to bypass TypeScript's
  // overlapping type check. This is safe because the structure is correct.
  return payload as unknown as PayloadForEvent<T>;
}
