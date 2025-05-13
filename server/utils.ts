import { randomBytes } from "crypto";

/**
 * Generates a unique API key string
 * @returns A random API key string with 'jag_k1_' prefix
 */
export function generateApiKeyString(): string {
  // Generate a random hex string of 48 characters
  const randomString = randomBytes(24).toString("hex");
  
  // Format the API key with a prefix
  return `jag_k1_${randomString}`;
}

/**
 * Creates a new API key object
 * @param developerId The ID of the developer
 * @param name The name of the API key
 * @returns An API key object with a unique key string
 */
export function createApiKey(developerId: number, name: string) {
  return {
    developerId,
    name,
    key: generateApiKeyString(),
    active: true,
    createdAt: new Date()
  };
}
