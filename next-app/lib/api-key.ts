import { randomBytes, createHash } from "crypto";

const API_KEY_PREFIX = "sk-proj-";
const API_KEY_LENGTH = 48; // Total characters after prefix (192 bits of entropy)

/**
 * Generate a cryptographically secure random string for API keys
 * Uses randomBytes from Node.js crypto for secure random generation
 */
function generateSecureRandomString(length: number): string {
  const bytes = randomBytes(Math.ceil(length / 2));
  return bytes.toString("hex").substring(0, length);
}

/**
 * Generate an API key following OpenAI's format: sk-proj-{48-char hex}
 * Provides 192 bits of entropy for cryptographic security
 */
export function generateApiKey(): string {
  const randomPart = generateSecureRandomString(API_KEY_LENGTH);
  return `${API_KEY_PREFIX}${randomPart}`;
}

/**
 * Generate a hashed version of the API key for secure storage
 * Never store raw API keys in the database
 */
export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Extract the prefix for display purposes
 * Returns format like sk-proj-xxxx...
 */
export function getApiKeyDisplay(apiKey: string): string {
  return apiKey.slice(0, 12) + "...";
}
