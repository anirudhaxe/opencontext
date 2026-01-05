import z from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sendWebhookEvent } from "../../../utils/webhook-client";
import { createWebhookPayload } from "../../../utils/webhook";
import { toolResponse } from "./utils";
import { getApiKey } from "../context";

export const registerContextRetrieverTool = (mcpServer: McpServer) => {
  mcpServer.registerTool(
    "context_retriever",
    {
      title: "Context Retriever",
      description: "Retrieve context about a particular query",
      inputSchema: {
        query: z
          .string()
          .describe("The query for which the context has to be retrieved"),
      },
      outputSchema: {
        retrievedContext: z.string(),
      },
    },
    async ({ query }) => {
      const apiKey = getApiKey();

      const res = await sendWebhookEvent(
        createWebhookPayload("mcp.toolcall", {
          apiKey,
          query,
          selection: "context_retriever",
        }),
      );

      if (!res)
        return toolResponse({
          retrievedContext:
            "ERROR: can't retrieve context due to unexpected error.",
        });

      const content = await res.json().catch((error) => {
        console.error("ERROR: while parsing webhook response ", error);
        return null;
      });

      if (!content)
        return toolResponse({
          retrievedContext:
            "ERROR: can't retrieve context due to unexpected error.",
        });

      return toolResponse(content);
    },
  );
};
