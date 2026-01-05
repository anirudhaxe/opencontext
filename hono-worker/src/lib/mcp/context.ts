import { AsyncLocalStorage } from "node:async_hooks";

// Create an async local storage instance for request-scoped context
const requestContextStorage = new AsyncLocalStorage<{ apiKey: string }>();

/**
 * Run a function with the given apiKey in the context
 */
export const runWithApiKey = <T>(apiKey: string, fn: () => Promise<T>): Promise<T> => {
  return requestContextStorage.run({ apiKey }, fn);
};

/**
 * Get the current request's apiKey from context
 * @throws {Error} if called outside of a request context
 */
export const getApiKey = (): string => {
  const context = requestContextStorage.getStore();
  if (!context) {
    throw new Error("API key not found in request context");
  }
  return context.apiKey;
};
