import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { handleTRPCProcedureError } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import {
  createApiKeyInDb,
  deleteApiKeyFromDb,
  lookupKeyDataByUserIdFromDb,
} from "@/db/apiKey";
import { generateApiKey, getApiKeyDisplay, hashApiKey } from "@/lib/api-key";

export const apiKeyRouteController = createTRPCRouter({
  getApiKey: protectedProcedure.query(async ({ ctx }) => {
    try {
      const keyData = await lookupKeyDataByUserIdFromDb(ctx.userId);
      const apiKeyDisplay = keyData[0]?.apiKeyDisplay;
      const createdAt = keyData[0]?.createdAt;

      if (apiKeyDisplay) {
        return {
          // only return the key display and created at for subsequent fetches (actual key will only be visible once upon creation)
          apiKeyDisplay,
          createdAt,
        };
      } else {
        return {
          apiKeyDisplay: null,
          createdAt: null,
        };
      }
    } catch (error) {
      handleTRPCProcedureError(error, "TRPC QUERY /getApiKey");
    }
  }),
  createApiKey: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const keyData = await lookupKeyDataByUserIdFromDb(ctx.userId);

      if (keyData.length)
        throw new TRPCError({
          code: "CONFLICT",
          message: "API key already exists for this user",
        });

      const apiKey = generateApiKey();
      const apiKeyHash = hashApiKey(apiKey);
      const apiKeyDisplay = getApiKeyDisplay(apiKey);

      const createdKeyId = await createApiKeyInDb(
        ctx.userId,
        // store hash version of the key in db
        apiKeyHash,
        // store key display in db
        apiKeyDisplay,
      );

      if (createdKeyId[0]?.id) {
        return {
          // return both api key and api key display for first time when key is created
          apiKey,
          apiKeyDisplay,
        };
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while trying to create API key",
        });
      }
    } catch (error) {
      handleTRPCProcedureError(error, "TRPC MUTATION /createApiKey");
    }
  }),
  deleteApiKey: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const deletedApiKeyId = await deleteApiKeyFromDb(ctx.userId);

      if (deletedApiKeyId[0]?.id) {
        return {
          status: "ok",
        };
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while trying to delete API key",
        });
      }
    } catch (error) {
      handleTRPCProcedureError(error, "TRPC MUTATION /deleteApiKey");
    }
  }),
});
