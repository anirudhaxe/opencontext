import { createTRPCRouter } from "../init";
import { apiKeyRouteController } from "./routeControllers/apiKey";
import { chatRouteController } from "./routeControllers/chat";
import { jobRouteController } from "./routeControllers/job";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  chat: chatRouteController,
  job: jobRouteController,
  apiKey: apiKeyRouteController,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
